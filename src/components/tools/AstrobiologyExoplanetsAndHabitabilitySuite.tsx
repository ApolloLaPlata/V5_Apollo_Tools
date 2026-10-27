'use client';

import React, { useState, useMemo } from 'react';
import {
  Globe,
  Compass,
  Activity,
  Sliders,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Info,
  Maximize2,
  BarChart2,
  Orbit,
  Zap,
  Flame,
  Radio,
  Eye,
  Layers,
  Share2,
  Atom,
  Circle,
  HelpCircle,
  ShieldAlert,
  Sun,
  Dna,
  Telescope
} from 'lucide-react';

export function AstrobiologyExoplanetsAndHabitabilitySuite({
  defaultTab = 'habitable-zone'
}: {
  defaultTab?: string;
}) {
  const [activeTab, setActiveTab] = useState<
    'habitable-zone' | 'transit-photometry' | 'earth-similarity' | 'biosignatures' | 'drake-equation'
  >(() => {
    if (defaultTab === 'exoplanet-transit-depth-tess-calc' || defaultTab === 'transit-photometry') return 'transit-photometry';
    if (defaultTab === 'earth-similarity-index-esi-calc' || defaultTab === 'earth-similarity') return 'earth-similarity';
    if (defaultTab === 'biosignature-spectroscopy-jwst-calc' || defaultTab === 'biosignatures') return 'biosignatures';
    if (defaultTab === 'drake-equation-fermi-paradox-calc' || defaultTab === 'drake-equation') return 'drake-equation';
    return 'habitable-zone';
  });

  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // -------------------------------------------------------------
  // TAB 1: ZONAS HABITÁVEIS ESTELARES (KOPPARAPU ET AL.)
  // -------------------------------------------------------------
  const [starType, setStarType] = useState<'M' | 'K' | 'G' | 'F'>('G');
  const [starLuminosity, setStarLuminosity] = useState<number>(1.0); // L_sol
  const [starTeff, setStarTeff] = useState<number>(5778); // Kelvin
  const [planetSemiMajorAxisAU, setPlanetSemiMajorAxisAU] = useState<number>(1.0); // UA

  const habitableZoneCalculations = useMemo(() => {
    // Parâmetros de Kopparapu et al. (2013/2014) para limites da Zona Habitável (HZ)
    const tStar = starTeff - 5780;

    // Coeficientes empíricos para fluxo efetivo S_eff
    const sRecentVenus = 1.776 + 2.136e-4 * tStar + 2.533e-8 * tStar * tStar;
    const sRunaway = 1.0385 + 1.2456e-4 * tStar + 1.4612e-8 * tStar * tStar;
    const sMaxGreenhouse = 0.3507 + 5.9578e-5 * tStar + 1.6707e-9 * tStar * tStar;
    const sEarlyMars = 0.3207 + 5.4471e-5 * tStar + 1.5275e-9 * tStar * tStar;

    // Distâncias orbitais d = sqrt(L / S_eff) em Unidades Astronômicas (UA)
    const dRecentVenus = Math.sqrt(starLuminosity / sRecentVenus);
    const dRunaway = Math.sqrt(starLuminosity / sRunaway);
    const dMaxGreenhouse = Math.sqrt(starLuminosity / sMaxGreenhouse);
    const dEarlyMars = Math.sqrt(starLuminosity / sEarlyMars);

    // Fluxo incidente no planeta S_p = L / d^2 (em fluxos solares S_0)
    const planetFlux = starLuminosity / (planetSemiMajorAxisAU * planetSemiMajorAxisAU);

    // Temperatura de equilíbrio planetária T_eq com albedo de Bond 0.3 (Terra)
    const albedoBond = 0.3;
    const tEquilibriumK = 278.5 * Math.pow(starLuminosity, 0.25) * Math.pow(1 / planetSemiMajorAxisAU, 0.5) * Math.pow(1 - albedoBond, 0.25);

    // Diagnóstico
    let status = 'Zona Tórrida (Super-Aquecido)';
    let statusColor = 'text-rose-400';
    if (planetSemiMajorAxisAU >= dRunaway && planetSemiMajorAxisAU <= dMaxGreenhouse) {
      status = 'Zona Habitável Conservadora (Água Líquida Estável)';
      statusColor = 'text-emerald-400';
    } else if (planetSemiMajorAxisAU >= dRecentVenus && planetSemiMajorAxisAU < dRunaway) {
      status = 'Zona Habitável Otimista Interna (Risco de Estufa Descontrolada)';
      statusColor = 'text-amber-400';
    } else if (planetSemiMajorAxisAU > dMaxGreenhouse && planetSemiMajorAxisAU <= dEarlyMars) {
      status = 'Zona Habitável Otimista Externa (Requer Efeito Estufa Massivo)';
      statusColor = 'text-cyan-400';
    } else if (planetSemiMajorAxisAU > dEarlyMars) {
      status = 'Zona Frígida (Congelamento Global / Glaciação)';
      statusColor = 'text-blue-400';
    }

    return {
      dRecentVenus,
      dRunaway,
      dMaxGreenhouse,
      dEarlyMars,
      planetFlux,
      tEquilibriumK,
      tEquilibriumC: tEquilibriumK - 273.15,
      status,
      statusColor
    };
  }, [starLuminosity, starTeff, planetSemiMajorAxisAU]);

  // -------------------------------------------------------------
  // TAB 2: FOTOMETRIA DE TRÂNSITO EXOPLANETÁRIO (TESS / KEPLER)
  // -------------------------------------------------------------
  const [planetRadiusEarth, setPlanetRadiusEarth] = useState<number>(1.0); // R_Terra
  const [starRadiusSolar, setStarRadiusSolar] = useState<number>(1.0); // R_Sol
  const [orbitalPeriodDays, setOrbitalPeriodDays] = useState<number>(365.25); // dias
  const [orbitalInclinationDeg, setOrbitalInclinationDeg] = useState<number>(90.0); // graus

  const transitCalculations = useMemo(() => {
    // 1 R_Terra = 6,371 km | 1 R_Sol = 696,340 km -> R_Terra / R_Sol ≈ 0.00915
    const radiusRatio = (planetRadiusEarth * 0.00915) / starRadiusSolar;

    // Profundidade de trânsito delta = (R_p / R_*)^2
    const transitDepthFraction = radiusRatio * radiusRatio;
    const transitDepthPpm = transitDepthFraction * 1e6; // ppm
    const transitDepthPercent = transitDepthFraction * 100;

    // Semi-eixo maior pela 3ª Lei de Kepler (assumindo M_* = 1 M_sol)
    const periodYears = orbitalPeriodDays / 365.25;
    const semiMajorAU = Math.pow(periodYears * periodYears, 1 / 3);

    // Parâmetro de impacto b = (a * cos(i)) / R_*
    const semiMajorSolarRadii = semiMajorAU * 215.0;
    const incRad = (orbitalInclinationDeg * Math.PI) / 180;
    const impactParameterB = (semiMajorSolarRadii * Math.cos(incRad)) / starRadiusSolar;

    // Duração do trânsito
    const k = radiusRatio;
    const canTransit = impactParameterB < (1 + k);
    let transitDurationHours = 0;
    if (canTransit) {
      const term = Math.sqrt(Math.max(0, Math.pow(1 + k, 2) - impactParameterB * impactParameterB));
      const durFraction = (starRadiusSolar / semiMajorSolarRadii) * term;
      transitDurationHours = (orbitalPeriodDays * 24 / Math.PI) * Math.asin(Math.min(1, durFraction));
    }

    let detector = 'TESS / Kepler (Detectável em Trânsito Único)';
    if (transitDepthPpm < 50) {
      detector = 'PLATO / ESPRESSO Ultra-Estável (Exige Múltiplos Co-Adições)';
    } else if (transitDepthPpm < 150) {
      detector = 'Kepler / CHEOPS Fotometria Espacial de Alta Precisão';
    }

    return {
      radiusRatio,
      transitDepthPpm,
      transitDepthPercent,
      semiMajorAU,
      impactParameterB,
      canTransit,
      transitDurationHours,
      detector
    };
  }, [planetRadiusEarth, starRadiusSolar, orbitalPeriodDays, orbitalInclinationDeg]);

  // -------------------------------------------------------------
  // TAB 3: ÍNDICE DE SIMILARIDADE COM A TERRA (ESI)
  // -------------------------------------------------------------
  const [esiRadius, setEsiRadius] = useState<number>(1.0); // R_Terra
  const [esiDensity, setEsiDensity] = useState<number>(1.0); // rho_Terra
  const [esiEscapeVelocity, setEsiEscapeVelocity] = useState<number>(1.0); // v_esc Terra
  const [esiSurfaceTempK, setEsiSurfaceTempK] = useState<number>(288); // Kelvin

  const esiCalculations = useMemo(() => {
    // Pesos do Earth Similarity Index (Schulze-Makuch et al. 2011)
    const r0 = 1.0;
    const rho0 = 1.0;
    const vesc0 = 1.0;
    const t0 = 288.0;

    const termR = Math.pow(1 - Math.abs((esiRadius - r0) / (esiRadius + r0)), 0.57);
    const termRho = Math.pow(1 - Math.abs((esiDensity - rho0) / (esiDensity + rho0)), 1.07);
    const esiInterior = Math.sqrt(termR * termRho);

    const termVesc = Math.pow(1 - Math.abs((esiEscapeVelocity - vesc0) / (esiEscapeVelocity + vesc0)), 0.70);
    const termT = Math.pow(1 - Math.abs((esiSurfaceTempK - t0) / (esiSurfaceTempK + t0)), 5.58);
    const esiSurface = Math.sqrt(termVesc * termT);

    const esiGlobal = Math.pow(termR * termRho * termVesc * termT, 1 / 4);

    let classification = 'Planeta Não-Telúrico / Joviano';
    let classColor = 'text-rose-400';
    if (esiGlobal >= 0.85) {
      classification = 'Análogo Terrestre de Elite (Gêmeo da Terra)';
      classColor = 'text-emerald-400';
    } else if (esiGlobal >= 0.70) {
      classification = 'Mundo Potencialmente Habitável (Candidato Telúrico)';
      classColor = 'text-cyan-400';
    } else if (esiGlobal >= 0.50) {
      classification = 'Sub-Terrestre / Mesoplaneta Frio ou Quente';
      classColor = 'text-amber-400';
    }

    return {
      esiInterior,
      esiSurface,
      esiGlobal,
      classification,
      classColor
    };
  }, [esiRadius, esiDensity, esiEscapeVelocity, esiSurfaceTempK]);

  // -------------------------------------------------------------
  // TAB 4: BIOASSINATURAS ESPECTROSCÓPICAS JWST
  // -------------------------------------------------------------
  const [o2Concentration, setO2Concentration] = useState<number>(20.9); // %
  const [ch4Ppm, setCh4Ppm] = useState<number>(1.8); // ppm
  const [waterVaporPercent, setWaterVaporPercent] = useState<number>(1.0); // %
  const [jwstNoiseSnr, setJwstNoiseSnr] = useState<number>(5.0); // SNR

  const biosignatureCalculations = useMemo(() => {
    // Desequilíbrio termodinâmico oxidante/redutor (O2 + CH4)
    const disequilibriumIndex = (o2Concentration / 21.0) * (ch4Ppm / 1.8);
    const isAbioticFalsePositiveRisk = o2Concentration > 50 && waterVaporPercent < 0.01;

    // Razão Sinal-Ruído ponderada para detecção pelo JWST
    const o2DetectabilitySigma = Math.min(15, (o2Concentration / 10.0) * jwstNoiseSnr * 0.8);
    const ch4DetectabilitySigma = Math.min(15, (Math.log10(Math.max(0.1, ch4Ppm)) + 1) * jwstNoiseSnr * 0.9);
    const h2oDetectabilitySigma = Math.min(15, Math.sqrt(waterVaporPercent) * jwstNoiseSnr * 1.2);

    let verdict = 'Bioassinatura Fraca / Abiótica';
    let verdictColor = 'text-slate-400';
    if (disequilibriumIndex >= 0.8 && jwstNoiseSnr >= 4.0 && !isAbioticFalsePositiveRisk) {
      verdict = 'Forte Par de Bioassinatura em Desequilíbrio (O₂ + CH₄ Detectado)';
      verdictColor = 'text-emerald-400';
    } else if (isAbioticFalsePositiveRisk) {
      verdict = 'Alerta: Falso Positivo Abiótico (Fotólise de Água Estelar)';
      verdictColor = 'text-amber-400';
    } else if (h2oDetectabilitySigma > 5.0) {
      verdict = 'Atmosfera Rica em Vapor d\'Água (H₂O) Detectada';
      verdictColor = 'text-cyan-400';
    }

    return {
      disequilibriumIndex,
      isAbioticFalsePositiveRisk,
      o2DetectabilitySigma,
      ch4DetectabilitySigma,
      h2oDetectabilitySigma,
      verdict,
      verdictColor
    };
  }, [o2Concentration, ch4Ppm, waterVaporPercent, jwstNoiseSnr]);

  // -------------------------------------------------------------
  // TAB 5: EQUAÇÃO DE DRAKE & PARADOXO DE FERMI
  // -------------------------------------------------------------
  const [rStarFormationRate, setRStarFormationRate] = useState<number>(2.0); // Estrelas/ano
  const [fPlanets, setFPlanets] = useState<number>(0.9); // Fração com planetas
  const [nHabitable, setNHabitable] = useState<number>(0.4); // Planetas habitáveis por sistema
  const [fLife, setFLife] = useState<number>(0.2); // Fração onde surge vida
  const [fIntelligence, setFIntelligence] = useState<number>(0.1); // Fração com inteligência
  const [fCommunication, setFCommunication] = useState<number>(0.2); // Fração comunicativa
  const [lLongevityYears, setLLongevityYears] = useState<number>(10000); // Anos

  const drakeCalculations = useMemo(() => {
    // N = R* · f_p · n_e · f_l · f_i · f_c · L
    const nCivilizations =
      rStarFormationRate * fPlanets * nHabitable * fLife * fIntelligence * fCommunication * lLongevityYears;

    const milkyWayVolumeLy3 = Math.PI * Math.pow(50000, 2) * 1000;
    const densityLy3 = Math.max(1, nCivilizations) / milkyWayVolumeLy3;
    const averageDistanceLightYears = Math.pow(1 / densityLy3, 1 / 3);

    let fermiResolution = 'Raridade da Terra (Filtro Precoce: Surgimento da Vida/Complexidade)';
    if (nCivilizations >= 1000) {
      fermiResolution = 'Zoológico Cósmico / Floresta Sombria (Civilizações Ocultas ou Trans-Sinais)';
    } else if (lLongevityYears < 1000) {
      fermiResolution = 'Autodestruição Tecnológica (Grande Filtro Tardio: L < 1000 anos)';
    }

    return {
      nCivilizations,
      averageDistanceLightYears,
      fermiResolution
    };
  }, [rStarFormationRate, fPlanets, nHabitable, fLife, fIntelligence, fCommunication, lLongevityYears]);

  return (
    <div className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-6 text-slate-100 shadow-2xl relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-800 gap-4 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 uppercase tracking-wider">
              Capitania #11 · O Centésimo Marco Sagrado (Etapa 100)
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              510 Ferramentas Ativas
            </span>
          </div>
          <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 to-indigo-300">
            Suíte de Astrobiologia, Bioassinaturas & Exoplanetas
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Modelagem das Zonas Habitáveis de Kopparapu, trânsitos fotométricos TESS/Kepler, Índice ESI de analogia terrestre, bioassinaturas atmosféricas do JWST e Equação de Drake.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const report = `[Relatório Astrobiológico - Etapa 100 (Marco 510 Ferramentas)]\n` +
                `- Zona Habitável (${starType}, L=${starLuminosity} L_sol): HZ Conservadora [${habitableZoneCalculations.dRunaway.toFixed(2)} - ${habitableZoneCalculations.dMaxGreenhouse.toFixed(2)} UA] | Status: ${habitableZoneCalculations.status}\n` +
                `- Trânsito TESS (${planetRadiusEarth} R_Terra em ${starRadiusSolar} R_Sol): Profundidade: ${transitCalculations.transitDepthPpm.toFixed(0)} ppm | Duração: ${transitCalculations.transitDurationHours.toFixed(2)} h\n` +
                `- Índice ESI: Global = ${esiCalculations.esiGlobal.toFixed(3)} | Classificação: ${esiCalculations.classification}\n` +
                `- Bioassinaturas JWST: Desequilíbrio O2/CH4 = ${biosignatureCalculations.disequilibriumIndex.toFixed(2)} | Veredito: ${biosignatureCalculations.verdict}\n` +
                `- Equação de Drake (L=${lLongevityYears} anos): N = ${drakeCalculations.nCivilizations.toFixed(1)} Civilizações | Distância Média: ${drakeCalculations.averageDistanceLightYears.toFixed(0)} anos-luz`;
              copyToClipboard(report);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-emerald-500 text-xs font-mono text-emerald-300 transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copiado!' : 'Copiar Resumo'}
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 mt-6 p-1.5 bg-slate-900/60 border border-slate-800/80 rounded-xl relative z-10">
        <button
          onClick={() => setActiveTab('habitable-zone')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
            activeTab === 'habitable-zone'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Sun className="w-3.5 h-3.5" />
          Zonas Habitáveis (Kopparapu)
        </button>

        <button
          onClick={() => setActiveTab('transit-photometry')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
            activeTab === 'transit-photometry'
              ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Telescope className="w-3.5 h-3.5" />
          Fotometria de Trânsito (TESS)
        </button>

        <button
          onClick={() => setActiveTab('earth-similarity')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
            activeTab === 'earth-similarity'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          Índice de Similaridade (ESI)
        </button>

        <button
          onClick={() => setActiveTab('biosignatures')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
            activeTab === 'biosignatures'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Dna className="w-3.5 h-3.5" />
          Bioassinaturas JWST
        </button>

        <button
          onClick={() => setActiveTab('drake-equation')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
            activeTab === 'drake-equation'
              ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Radio className="w-3.5 h-3.5" />
          Equação de Drake & Fermi
        </button>
      </div>

      {/* TAB CONTENT */}
      <div className="mt-6 relative z-10">
        {/* ========================================================================= */}
        {/* 1. ZONAS HABITÁVEIS (KOPPARAPU) */}
        {/* ========================================================================= */}
        {activeTab === 'habitable-zone' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Controles */}
              <div className="lg:col-span-5 bg-slate-900/40 border border-slate-800/80 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                    <Sun className="w-4 h-4" /> Parâmetros Estelares & Planetários
                  </h3>
                  <button
                    onClick={() => {
                      setStarType('G');
                      setStarLuminosity(1.0);
                      setStarTeff(5778);
                      setPlanetSemiMajorAxisAU(1.0);
                    }}
                    className="text-[11px] font-mono text-slate-500 hover:text-slate-300 flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" /> Reset
                  </button>
                </div>

                <div>
                  <label className="text-xs font-mono text-slate-400 mb-1.5 block">Tipo Espectral da Estrela Hospedeira:</label>
                  <div className="grid grid-cols-4 gap-2">
                    {(['M', 'K', 'G', 'F'] as const).map((type) => (
                      <button
                        key={type}
                        onClick={() => {
                          setStarType(type);
                          if (type === 'M') { setStarLuminosity(0.01); setStarTeff(3200); setPlanetSemiMajorAxisAU(0.1); }
                          else if (type === 'K') { setStarLuminosity(0.2); setStarTeff(4500); setPlanetSemiMajorAxisAU(0.5); }
                          else if (type === 'G') { setStarLuminosity(1.0); setStarTeff(5778); setPlanetSemiMajorAxisAU(1.0); }
                          else { setStarLuminosity(3.0); setStarTeff(6800); setPlanetSemiMajorAxisAU(1.8); }
                        }}
                        className={`py-1.5 px-2 rounded-lg text-xs font-mono transition ${
                          starType === type
                            ? 'bg-emerald-600 text-white font-bold'
                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                        }`}
                      >
                        Tipo {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-slate-400">Luminosidade Estelar (L/L_sol):</span>
                    <span className="text-emerald-400 font-bold">{starLuminosity} L_☉</span>
                  </div>
                  <input
                    type="range"
                    min="0.001"
                    max="5.0"
                    step="0.05"
                    value={starLuminosity}
                    onChange={(e) => setStarLuminosity(Number(e.target.value))}
                    className="w-full accent-emerald-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-slate-400">Semi-eixo Maior do Planeta (a):</span>
                    <span className="text-emerald-400 font-bold">{planetSemiMajorAxisAU} UA</span>
                  </div>
                  <input
                    type="range"
                    min="0.05"
                    max="3.0"
                    step="0.05"
                    value={planetSemiMajorAxisAU}
                    onChange={(e) => setPlanetSemiMajorAxisAU(Number(e.target.value))}
                    className="w-full accent-emerald-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>

              {/* Resultados */}
              <div className="lg:col-span-7 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 bg-slate-900/60 border border-emerald-500/30 rounded-xl col-span-2">
                    <span className="text-[10px] font-mono text-slate-400 block uppercase">Diagnóstico de Habitabilidade</span>
                    <span className={`text-xl font-bold font-mono ${habitableZoneCalculations.statusColor}`}>
                      {habitableZoneCalculations.status}
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-1">
                      Fluxo estelar: {habitableZoneCalculations.planetFlux.toFixed(2)} S_☉ | T_eq: {habitableZoneCalculations.tEquilibriumC.toFixed(1)} °C ({habitableZoneCalculations.tEquilibriumK.toFixed(0)} K)
                    </span>
                  </div>

                  <div className="p-3.5 bg-slate-900/60 border border-slate-800 rounded-xl">
                    <span className="text-[10px] font-mono text-slate-400 block uppercase">HZ Conservadora</span>
                    <span className="text-lg font-bold font-mono text-cyan-400">
                      {habitableZoneCalculations.dRunaway.toFixed(2)} a {habitableZoneCalculations.dMaxGreenhouse.toFixed(2)} UA
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-1">
                      Kopparapu et al. (R-C Climate Models)
                    </span>
                  </div>

                  <div className="p-3.5 bg-slate-900/60 border border-slate-800 rounded-xl">
                    <span className="text-[10px] font-mono text-slate-400 block uppercase">HZ Otimista</span>
                    <span className="text-lg font-bold font-mono text-purple-400">
                      {habitableZoneCalculations.dRecentVenus.toFixed(2)} a {habitableZoneCalculations.dEarlyMars.toFixed(2)} UA
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-1">
                      Evidências geológicas de Marte e Vênus
                    </span>
                  </div>
                </div>

                {/* Régua da Zona Habitável SVG */}
                <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl">
                  <div className="text-xs font-mono text-slate-400 mb-2 flex justify-between">
                    <span>Mapeamento Orbital da Zona Habitável (UA)</span>
                    <span className="text-emerald-400">Escala de 0 a 3.0 UA</span>
                  </div>
                  <svg viewBox="0 0 500 100" className="w-full h-24 bg-slate-950/60 rounded-lg p-2 border border-slate-800">
                    <circle cx="20" cy="50" r="12" fill={starType === 'M' ? '#f43f5e' : starType === 'K' ? '#fb923c' : starType === 'G' ? '#facc15' : '#60a5fa'} />

                    <rect
                      x={20 + (habitableZoneCalculations.dRecentVenus / 3.0) * 440}
                      y="30"
                      width={Math.max(10, ((habitableZoneCalculations.dEarlyMars - habitableZoneCalculations.dRecentVenus) / 3.0) * 440)}
                      height="40"
                      fill="#06b6d4"
                      fillOpacity="0.2"
                      stroke="#06b6d4"
                      strokeDasharray="2 2"
                    />

                    <rect
                      x={20 + (habitableZoneCalculations.dRunaway / 3.0) * 440}
                      y="30"
                      width={Math.max(10, ((habitableZoneCalculations.dMaxGreenhouse - habitableZoneCalculations.dRunaway) / 3.0) * 440)}
                      height="40"
                      fill="#10b981"
                      fillOpacity="0.35"
                      stroke="#10b981"
                    />

                    <circle
                      cx={20 + Math.min(460, (planetSemiMajorAxisAU / 3.0) * 440)}
                      cy="50"
                      r="6"
                      fill="#38bdf8"
                      stroke="#ffffff"
                      strokeWidth="1.5"
                    />
                    <text
                      x={20 + Math.min(460, (planetSemiMajorAxisAU / 3.0) * 440)}
                      y="20"
                      textAnchor="middle"
                      fill="#38bdf8"
                      fontSize="9"
                      fontFamily="monospace"
                    >
                      {planetSemiMajorAxisAU} UA
                    </text>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 2. FOTOMETRIA DE TRÂNSITO (TESS) */}
        {/* ========================================================================= */}
        {activeTab === 'transit-photometry' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Controles */}
              <div className="lg:col-span-5 bg-slate-900/40 border border-slate-800/80 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-bold text-cyan-400 flex items-center gap-2">
                    <Telescope className="w-4 h-4" /> Parâmetros de Trânsito
                  </h3>
                  <button
                    onClick={() => {
                      setPlanetRadiusEarth(1.0);
                      setStarRadiusSolar(1.0);
                      setOrbitalPeriodDays(365.25);
                      setOrbitalInclinationDeg(90.0);
                    }}
                    className="text-[11px] font-mono text-slate-500 hover:text-slate-300 flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" /> Reset
                  </button>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-slate-400">Raio do Exoplaneta (R/R_Terra):</span>
                    <span className="text-cyan-400 font-bold">{planetRadiusEarth} R_⊕</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="15.0"
                    step="0.5"
                    value={planetRadiusEarth}
                    onChange={(e) => setPlanetRadiusEarth(Number(e.target.value))}
                    className="w-full accent-cyan-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-slate-400">Raio da Estrela (R/R_Sol):</span>
                    <span className="text-cyan-400 font-bold">{starRadiusSolar} R_☉</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="2.5"
                    step="0.1"
                    value={starRadiusSolar}
                    onChange={(e) => setStarRadiusSolar(Number(e.target.value))}
                    className="w-full accent-cyan-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-slate-400">Inclinação Orbital (i):</span>
                    <span className="text-cyan-400 font-bold">{orbitalInclinationDeg}°</span>
                  </div>
                  <input
                    type="range"
                    min="85.0"
                    max="90.0"
                    step="0.1"
                    value={orbitalInclinationDeg}
                    onChange={(e) => setOrbitalInclinationDeg(Number(e.target.value))}
                    className="w-full accent-cyan-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>

              {/* Resultados */}
              <div className="lg:col-span-7 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 bg-slate-900/60 border border-cyan-500/30 rounded-xl">
                    <span className="text-[10px] font-mono text-slate-400 block uppercase">Profundidade do Trânsito (ΔF/F)</span>
                    <span className="text-2xl font-black font-mono text-cyan-300">
                      {transitCalculations.transitDepthPpm.toFixed(1)} ppm
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-1">
                      {transitCalculations.transitDepthPercent.toFixed(4)}% do fluxo estelar
                    </span>
                  </div>

                  <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
                    <span className="text-[10px] font-mono text-slate-400 block uppercase">Duração do Trânsito (T_dur)</span>
                    <span className="text-2xl font-bold font-mono text-emerald-400">
                      {transitCalculations.canTransit ? `${transitCalculations.transitDurationHours.toFixed(2)} horas` : 'Sem Trânsito'}
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-1">
                      Parâmetro de impacto b = {transitCalculations.impactParameterB.toFixed(3)}
                    </span>
                  </div>

                  <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl col-span-2">
                    <span className="text-[10px] font-mono text-slate-400 block uppercase">Sensibilidade Instrumental Requerida</span>
                    <span className="text-lg font-bold font-mono text-purple-400">
                      {transitCalculations.detector}
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-1">
                      Razão de raios k = R_p / R_* = {(transitCalculations.radiusRatio * 100).toFixed(3)}%
                    </span>
                  </div>
                </div>

                {/* Curva de Luz de Trânsito SVG */}
                <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl">
                  <div className="text-xs font-mono text-slate-400 mb-2 flex justify-between">
                    <span>Curva de Luz Fotométrica (Fluxo Relativo vs Tempo)</span>
                    <span className="text-cyan-400">Escurecimento de Limbo Simulado</span>
                  </div>
                  <svg viewBox="0 0 500 110" className="w-full h-24 bg-slate-950/60 rounded-lg p-2 border border-slate-800">
                    <line x1="30" y1="25" x2="470" y2="25" stroke="#334155" strokeDasharray="3 3" />
                    <text x="15" y="28" fill="#64748b" fontSize="9" fontFamily="monospace">1.0</text>

                    <path
                      d="M 30,25 L 180,25 Q 210,85 250,85 Q 290,85 320,25 L 470,25"
                      fill="none"
                      stroke="#06b6d4"
                      strokeWidth="3"
                    />

                    <line x1="250" y1="25" x2="250" y2="85" stroke="#f43f5e" strokeWidth="1" strokeDasharray="2 2" />
                    <text x="255" y="60" fill="#f43f5e" fontSize="9" fontFamily="monospace">
                      ΔF = {transitCalculations.transitDepthPpm.toFixed(0)} ppm
                    </text>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 3. ÍNDICE DE SIMILARIDADE COM A TERRA (ESI) */}
        {/* ========================================================================= */}
        {activeTab === 'earth-similarity' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Controles */}
              <div className="lg:col-span-5 bg-slate-900/40 border border-slate-800/80 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-bold text-indigo-400 flex items-center gap-2">
                    <Globe className="w-4 h-4" /> Propriedades Planetárias Físicas
                  </h3>
                  <button
                    onClick={() => {
                      setEsiRadius(1.0);
                      setEsiDensity(1.0);
                      setEsiEscapeVelocity(1.0);
                      setEsiSurfaceTempK(288);
                    }}
                    className="text-[11px] font-mono text-slate-500 hover:text-slate-300 flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" /> Reset
                  </button>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-slate-400">Raio Médio (R/R_Terra):</span>
                    <span className="text-indigo-400 font-bold">{esiRadius} R_⊕</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="2.5"
                    step="0.05"
                    value={esiRadius}
                    onChange={(e) => setEsiRadius(Number(e.target.value))}
                    className="w-full accent-indigo-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-slate-400">Densidade Volumétrica (ρ/ρ_Terra):</span>
                    <span className="text-indigo-400 font-bold">{esiDensity} ρ_⊕</span>
                  </div>
                  <input
                    type="range"
                    min="0.3"
                    max="2.0"
                    step="0.05"
                    value={esiDensity}
                    onChange={(e) => setEsiDensity(Number(e.target.value))}
                    className="w-full accent-indigo-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-slate-400">Temperatura Superficial:</span>
                    <span className="text-indigo-400 font-bold">{esiSurfaceTempK} K ({(esiSurfaceTempK - 273.15).toFixed(0)}°C)</span>
                  </div>
                  <input
                    type="range"
                    min="150"
                    max="450"
                    step="5"
                    value={esiSurfaceTempK}
                    onChange={(e) => setEsiSurfaceTempK(Number(e.target.value))}
                    className="w-full accent-indigo-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>

              {/* Resultados */}
              <div className="lg:col-span-7 space-y-4">
                <div className="p-4 bg-slate-900/60 border border-indigo-500/30 rounded-xl">
                  <span className="text-[10px] font-mono text-slate-400 block uppercase">Índice Global de Similaridade com a Terra (ESI)</span>
                  <span className="text-3xl font-black font-mono text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-cyan-300 to-emerald-300">
                    ESI = {esiCalculations.esiGlobal.toFixed(3)}
                  </span>
                  <span className={`text-xs font-bold block mt-1 ${esiCalculations.classColor}`}>
                    {esiCalculations.classification}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 bg-slate-900/60 border border-slate-800 rounded-xl">
                    <span className="text-[10px] font-mono text-slate-400 block uppercase">ESI Interior (Raio & Densidade)</span>
                    <span className="text-xl font-bold font-mono text-cyan-400">
                      {esiCalculations.esiInterior.toFixed(3)}
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-1">
                      Composição rochosa / núcleo metálico
                    </span>
                  </div>

                  <div className="p-3.5 bg-slate-900/60 border border-slate-800 rounded-xl">
                    <span className="text-[10px] font-mono text-slate-400 block uppercase">ESI Superfície (v_esc & Temperatura)</span>
                    <span className="text-xl font-bold font-mono text-purple-400">
                      {esiCalculations.esiSurface.toFixed(3)}
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-1">
                      Condições climáticas para água líquida
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl">
                  <div className="text-xs font-mono text-slate-300 font-bold mb-1">
                    Benchmarks da Astrobiologia Real
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center text-[11px] font-mono mt-2">
                    <div className="p-2 bg-slate-950 rounded border border-slate-800">
                      <div className="text-slate-400">Marte</div>
                      <div className="text-amber-400 font-bold">ESI: 0.697</div>
                    </div>
                    <div className="p-2 bg-slate-950 rounded border border-slate-800">
                      <div className="text-slate-400">TRAPPIST-1e</div>
                      <div className="text-emerald-400 font-bold">ESI: 0.850</div>
                    </div>
                    <div className="p-2 bg-slate-950 rounded border border-slate-800">
                      <div className="text-slate-400">Kepler-452b</div>
                      <div className="text-cyan-400 font-bold">ESI: 0.830</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 4. BIOASSINATURAS ESPECTROSCÓPICAS JWST */}
        {/* ========================================================================= */}
        {activeTab === 'biosignatures' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Controles */}
              <div className="lg:col-span-5 bg-slate-900/40 border border-slate-800/80 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-bold text-purple-400 flex items-center gap-2">
                    <Dna className="w-4 h-4" /> Composição Atmosférica & Espectro
                  </h3>
                  <button
                    onClick={() => {
                      setO2Concentration(20.9);
                      setCh4Ppm(1.8);
                      setWaterVaporPercent(1.0);
                      setJwstNoiseSnr(5.0);
                    }}
                    className="text-[11px] font-mono text-slate-500 hover:text-slate-300 flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" /> Reset
                  </button>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-slate-400">Oxigênio Molecular (O₂):</span>
                    <span className="text-purple-400 font-bold">{o2Concentration}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="60.0"
                    step="0.5"
                    value={o2Concentration}
                    onChange={(e) => setO2Concentration(Number(e.target.value))}
                    className="w-full accent-purple-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-slate-400">Metano Atmosférico (CH₄):</span>
                    <span className="text-purple-400 font-bold">{ch4Ppm} ppm</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="50.0"
                    step="0.5"
                    value={ch4Ppm}
                    onChange={(e) => setCh4Ppm(Number(e.target.value))}
                    className="w-full accent-purple-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-slate-400">Qualidade Espectral JWST (SNR):</span>
                    <span className="text-purple-400 font-bold">{jwstNoiseSnr}σ</span>
                  </div>
                  <input
                    type="range"
                    min="2.0"
                    max="10.0"
                    step="0.5"
                    value={jwstNoiseSnr}
                    onChange={(e) => setJwstNoiseSnr(Number(e.target.value))}
                    className="w-full accent-purple-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>

              {/* Resultados */}
              <div className="lg:col-span-7 space-y-4">
                <div className="p-4 bg-slate-900/60 border border-purple-500/30 rounded-xl">
                  <span className="text-[10px] font-mono text-slate-400 block uppercase">Diagnóstico de Desequilíbrio Termodinâmico</span>
                  <span className={`text-xl font-bold font-mono block mt-1 ${biosignatureCalculations.verdictColor}`}>
                    {biosignatureCalculations.verdict}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-2">
                    Índice de coexistência metabólica O₂ + CH₄: {biosignatureCalculations.disequilibriumIndex.toFixed(2)}x Nível Terrestre
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl text-center">
                    <span className="text-[10px] font-mono text-slate-400 block uppercase">Sinal O₂ / O₃</span>
                    <span className="text-lg font-bold font-mono text-emerald-400">
                      {biosignatureCalculations.o2DetectabilitySigma.toFixed(1)}σ
                    </span>
                  </div>

                  <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl text-center">
                    <span className="text-[10px] font-mono text-slate-400 block uppercase">Sinal CH₄</span>
                    <span className="text-lg font-bold font-mono text-cyan-400">
                      {biosignatureCalculations.ch4DetectabilitySigma.toFixed(1)}σ
                    </span>
                  </div>

                  <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl text-center">
                    <span className="text-[10px] font-mono text-slate-400 block uppercase">Sinal H₂O</span>
                    <span className="text-lg font-bold font-mono text-blue-400">
                      {biosignatureCalculations.h2oDetectabilitySigma.toFixed(1)}σ
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl">
                  <div className="text-xs font-mono text-slate-300 font-bold mb-1">
                    Espectroscopia de Transmissão com NIRSpec / MIRI
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Quando a luz da estrela filtra através da atmosfera durante o trânsito primário, moléculas absorvem fótons em bandas diagnósticas (O₃ em 9.6 μm, CH₄ em 3.3 μm e H₂O em 1.4/1.9 μm). A detecção simultânea de um oxidante forte (O₂) e um gás redutor (CH₄) em níveis superiores ao equilíbrio químico termodinâmico é a evidência mais robusta de vida exoplanetária.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 5. EQUAÇÃO DE DRAKE & PARADOXO DE FERMI */}
        {/* ========================================================================= */}
        {activeTab === 'drake-equation' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Controles */}
              <div className="lg:col-span-5 bg-slate-900/40 border border-slate-800/80 rounded-xl p-5 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2">
                    <Radio className="w-4 h-4" /> Variáveis de Drake
                  </h3>
                  <button
                    onClick={() => {
                      setRStarFormationRate(2.0);
                      setFPlanets(0.9);
                      setNHabitable(0.4);
                      setFLife(0.2);
                      setFIntelligence(0.1);
                      setFCommunication(0.2);
                      setLLongevityYears(10000);
                    }}
                    className="text-[11px] font-mono text-slate-500 hover:text-slate-300 flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" /> Reset
                  </button>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono mb-0.5">
                    <span className="text-slate-400">Longevidade da Civilização (L):</span>
                    <span className="text-amber-400 font-bold">{lLongevityYears.toLocaleString()} anos</span>
                  </div>
                  <input
                    type="range"
                    min="100"
                    max="1000000"
                    step="5000"
                    value={lLongevityYears}
                    onChange={(e) => setLLongevityYears(Number(e.target.value))}
                    className="w-full accent-amber-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono mb-0.5">
                    <span className="text-slate-400">Fração onde surge Vida (f_l):</span>
                    <span className="text-amber-400 font-bold">{(fLife * 100).toFixed(0)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.01"
                    max="1.0"
                    step="0.05"
                    value={fLife}
                    onChange={(e) => setFLife(Number(e.target.value))}
                    className="w-full accent-amber-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono mb-0.5">
                    <span className="text-slate-400">Fração com Inteligência (f_i):</span>
                    <span className="text-amber-400 font-bold">{(fIntelligence * 100).toFixed(0)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.001"
                    max="0.5"
                    step="0.01"
                    value={fIntelligence}
                    onChange={(e) => setFIntelligence(Number(e.target.value))}
                    className="w-full accent-amber-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono mb-0.5">
                    <span className="text-slate-400">Fração Comunicativa (f_c):</span>
                    <span className="text-amber-400 font-bold">{(fCommunication * 100).toFixed(0)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.01"
                    max="1.0"
                    step="0.05"
                    value={fCommunication}
                    onChange={(e) => setFCommunication(Number(e.target.value))}
                    className="w-full accent-amber-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>

              {/* Resultados */}
              <div className="lg:col-span-7 space-y-4">
                <div className="p-4 bg-slate-900/60 border border-amber-500/30 rounded-xl">
                  <span className="text-[10px] font-mono text-slate-400 block uppercase">Civilizações Comunicativas Ativas na Galáxia (N)</span>
                  <span className="text-3xl font-black font-mono text-amber-300">
                    N ≈ {drakeCalculations.nCivilizations >= 1 ? drakeCalculations.nCivilizations.toFixed(1) : '< 1 (Civilização Solitária)'}
                  </span>
                  <span className="text-xs text-slate-400 block mt-1">
                    Distância média para o vizinho mais próximo: ~ {drakeCalculations.averageDistanceLightYears.toFixed(0)} anos-luz
                  </span>
                </div>

                <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
                  <span className="text-[10px] font-mono text-slate-400 block uppercase">Hipótese do Grande Filtro & Paradoxo de Fermi</span>
                  <span className="text-base font-bold font-mono text-cyan-300 block mt-1">
                    {drakeCalculations.fermiResolution}
                  </span>
                  <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                    Se N for grande e a galáxia tiver 13.6 bilhões de anos, ondas de rádio e sondas de von Neumann já deveriam ter cruzado o espaço interestelar. A ausência de sinais ("O Grande Silêncio") implica que ou o surgimento de inteligência é incrivelmente raro (Grande Filtro atrás de nós) ou o tempo de sobrevivência de civilizações tecnológicas L é curto (Grande Filtro à nossa frente).
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="mt-8 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono text-slate-500 gap-2">
        <div className="flex items-center gap-2">
          <Info className="w-3.5 h-3.5 text-emerald-400" />
          <span>Fórmulas analíticas derivadas de Kopparapu (2014), Mandel-Agol (2002) e modelos de biosferas exoplanetárias.</span>
        </div>
        <div className="text-slate-400">
          Holding V5 Apollo · 100% Client-Side Engine
        </div>
      </div>
    </div>
  );
}
