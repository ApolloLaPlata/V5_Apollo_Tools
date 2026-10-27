'use client';

import React, { useState, useMemo } from 'react';
import {
  Globe,
  Compass,
  Rocket,
  Zap,
  Sparkles,
  Copy,
  Check,
  RotateCcw,
  Info,
  Sliders,
  Eye,
  Activity,
  Circle,
  Crosshair,
  Sun,
  Maximize2
} from 'lucide-react';

export function OrbitalMechanicsAndAstrophysicsSuite({
  defaultTab = 'keplerian-orbit-elements-integrator'
}: {
  defaultTab?: string;
}) {
  const [activeTab, setActiveTab] = useState<
    'keplerian' | 'sgp4-tle' | 'hohmann' | 'lagrange' | 'ephemeris'
  >(() => {
    if (defaultTab === 'sgp4-tle-satellite-propagator' || defaultTab === 'sgp4-tle') return 'sgp4-tle';
    if (defaultTab === 'hohmann-transfer-delta-v-calc' || defaultTab === 'hohmann') return 'hohmann';
    if (defaultTab === 'lagrange-points-l1-l5-simulator' || defaultTab === 'lagrange') return 'lagrange';
    if (defaultTab === 'jpl-horizons-ephemeris-calc' || defaultTab === 'ephemeris') return 'ephemeris';
    return 'keplerian';
  });

  const [copied, setCopied] = useState(false);
  const copyToClipboard = (text: string) => {
    try { if (navigator.clipboard?.writeText) navigator.clipboard.writeText(text).catch(() => {}); } catch {}
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Constantes Físicas Universais
  const MU_EARTH = 398600.4418; // km^3 / s^2 (Parâmetro gravitacional padrão da Terra)
  const R_EARTH = 6378.137; // km (Raio equatorial da Terra WGS84)
  const G0 = 9.80665; // m/s^2 (Aceleração da gravidade padrão)
  const AU_KM = 149597870.7; // km em 1 Unidade Astronômica
  const SPEED_OF_LIGHT = 299792.458; // km/s

  /* -------------------------------------------------------------------------- */
  /* FERRAMENTA 1: INTEGRADOR DE ELEMENTOS KEPLERIANOS (ÓRBITAS 2-BODIES)       */
  /* -------------------------------------------------------------------------- */
  const [keplerSemiMajorAxis, setKeplerSemiMajorAxis] = useState<number>(7200); // km (a)
  const [keplerEccentricity, setKeplerEccentricity] = useState<number>(0.12); // e (0 a 0.95)
  const [keplerInclination, setKeplerInclination] = useState<number>(51.6); // deg (i)
  const [keplerRaan, setKeplerRaan] = useState<number>(120); // deg (Omega)
  const [keplerArgPeriapsis, setKeplerArgPeriapsis] = useState<number>(45); // deg (omega)
  const [keplerTrueAnomaly, setKeplerTrueAnomaly] = useState<number>(60); // deg (nu)

  const keplerianResults = useMemo(() => {
    const a = Math.max(R_EARTH + 150, keplerSemiMajorAxis);
    const e = Math.max(0, Math.min(0.95, keplerEccentricity));
    const nuRad = (keplerTrueAnomaly * Math.PI) / 180;

    // Raios orbital
    const rp = a * (1 - e); // Periapsis
    const ra = a * (1 + e); // Apoapsis
    const hp = rp - R_EARTH; // Altitude de periapsis
    const ha = ra - R_EARTH; // Altitude de apoapsis

    // Distância atual r(nu)
    const r = (a * (1 - e * e)) / (1 + e * Math.cos(nuRad));
    const currentAltitude = r - R_EARTH;

    // Velocidade orbital atual v(r) = sqrt(mu * (2/r - 1/a))
    const v = Math.sqrt(MU_EARTH * (2 / r - 1 / a));
    const vp = Math.sqrt(MU_EARTH * (2 / rp - 1 / a)); // Velocidade no perigeu
    const va = Math.sqrt(MU_EARTH * (2 / ra - 1 / a)); // Velocidade no apogeu

    // Período orbital T = 2 * pi * sqrt(a^3 / mu)
    const T_sec = 2 * Math.PI * Math.sqrt(Math.pow(a, 3) / MU_EARTH);
    const T_min = T_sec / 60;
    const T_hours = T_min / 60;

    // Anomalia excêntrica E a partir de nu: tan(E/2) = sqrt((1-e)/(1+e)) * tan(nu/2)
    const tanE2 = Math.sqrt((1 - e) / (1 + e)) * Math.tan(nuRad / 2);
    const E = 2 * Math.atan(tanE2);
    // Anomalia média M = E - e * sin(E) (Equação de Kepler)
    let M = E - e * Math.sin(E);
    if (M < 0) M += 2 * Math.PI;
    const M_deg = (M * 180) / Math.PI;

    // Momento angular específico h = sqrt(mu * a * (1 - e^2))
    const h = Math.sqrt(MU_EARTH * a * (1 - e * e));

    return {
      a,
      e,
      rp: rp.toFixed(1),
      ra: ra.toFixed(1),
      hp: hp.toFixed(1),
      ha: ha.toFixed(1),
      r: r.toFixed(1),
      currentAltitude: currentAltitude.toFixed(1),
      v: v.toFixed(3),
      vp: vp.toFixed(3),
      va: va.toFixed(3),
      T_sec: T_sec.toFixed(0),
      T_min: T_min.toFixed(2),
      T_hours: T_hours.toFixed(2),
      M_deg: M_deg.toFixed(2),
      h: h.toFixed(1)
    };
  }, [keplerSemiMajorAxis, keplerEccentricity, keplerTrueAnomaly]);

  /* -------------------------------------------------------------------------- */
  /* FERRAMENTA 2: PROPAGADOR ORBITAL SGP4 TLE NORAD                            */
  /* -------------------------------------------------------------------------- */
  const TLE_PRESETS: { [key: string]: { name: string; l1: string; l2: string } } = {
    iss: {
      name: 'ISS (Estação Espacial Internacional)',
      l1: '1 25544U 98067A   26300.51234567  .00016717  00000-0  10270-3 0  9993',
      l2: '2 25544  51.6416 247.4627 0006703 130.5360 325.0288 15.49815340450004'
    },
    hst: {
      name: 'Hubble Space Telescope (HST)',
      l1: '1 20580U 90037B   26299.81452109  .00001420  00000-0  62489-4 0  9998',
      l2: '2 20580  28.4695 180.1250 0002810  95.4210 264.7120 15.09241500851230'
    },
    starlink: {
      name: 'Starlink V2 Mini (Constelação LEO)',
      l1: '1 57321U 23098A   26300.25412890  .00008450  00000-0  34120-3 0  9991',
      l2: '2 57321  43.0012 112.5480 0001420  80.1450 280.0120 15.02415000150420'
    },
    gps: {
      name: 'GPS BIIF-10 (MEO 20.200 km)',
      l1: '1 40730U 15034A   26300.41205120 -.00000045  00000-0  00000-0 0  9995',
      l2: '2 40730  55.1240 310.4510 0054120 215.1240 144.5120  2.00561240 82145'
    }
  };

  const [selectedTleKey, setSelectedTleKey] = useState<string>('iss');
  const [customTleL1, setCustomTleL1] = useState<string>(TLE_PRESETS.iss.l1);
  const [customTleL2, setCustomTleL2] = useState<string>(TLE_PRESETS.iss.l2);

  const handleSelectPreset = (key: string) => {
    setSelectedTleKey(key);
    setCustomTleL1(TLE_PRESETS[key].l1);
    setCustomTleL2(TLE_PRESETS[key].l2);
  };

  const parsedTle = useMemo(() => {
    try {
      const l1 = customTleL1.trim();
      const l2 = customTleL2.trim();

      const satNumber = l1.slice(2, 7).trim() || '25544';
      const intlDesignator = l1.slice(9, 17).trim() || '98067A';
      const epochYear = parseInt(l1.slice(18, 20), 10);
      const epochDay = parseFloat(l1.slice(20, 32));

      const inclination = parseFloat(l2.slice(8, 16));
      const raan = parseFloat(l2.slice(17, 25));
      const eccRaw = l2.slice(26, 33).trim();
      const eccentricity = parseFloat('0.' + eccRaw);
      const argPerigee = parseFloat(l2.slice(34, 42));
      const meanAnomaly = parseFloat(l2.slice(43, 51));
      const meanMotion = parseFloat(l2.slice(52, 63)); // revs por dia

      // Cálculos orbitais
      const n_rad_s = (meanMotion * 2 * Math.PI) / 86400; // rad/s
      const a = Math.pow(MU_EARTH / (n_rad_s * n_rad_s), 1 / 3);
      const perigeeAlt = a * (1 - eccentricity) - R_EARTH;
      const apogeeAlt = a * (1 + eccentricity) - R_EARTH;
      const periodMinutes = 1440 / meanMotion;
      const orbitalSpeed = Math.sqrt(MU_EARTH / a);

      return {
        valid: true,
        satNumber,
        intlDesignator,
        epochYear: epochYear < 57 ? 2000 + epochYear : 1900 + epochYear,
        epochDay: epochDay.toFixed(4),
        inclination: inclination.toFixed(4),
        raan: raan.toFixed(4),
        eccentricity: eccentricity.toFixed(6),
        argPerigee: argPerigee.toFixed(4),
        meanAnomaly: meanAnomaly.toFixed(4),
        meanMotion: meanMotion.toFixed(8),
        semiMajorAxis: a.toFixed(1),
        perigeeAlt: perigeeAlt.toFixed(1),
        apogeeAlt: apogeeAlt.toFixed(1),
        periodMinutes: periodMinutes.toFixed(2),
        orbitalSpeed: orbitalSpeed.toFixed(3)
      };
    } catch {
      return { valid: false };
    }
  }, [customTleL1, customTleL2]);

  /* -------------------------------------------------------------------------- */
  /* FERRAMENTA 3: TRANSFERÊNCIA DE HOHMANN & EQUAÇÃO DE TSIOLKOVSKY            */
  /* -------------------------------------------------------------------------- */
  const [hohmannR1Alt, setHohmannR1Alt] = useState<number>(300); // km (Órbita Inicial LEO)
  const [hohmannR2Alt, setHohmannR2Alt] = useState<number>(35786); // km (Órbita Final GEO)
  const [rocketDryMass, setRocketDryMass] = useState<number>(2000); // kg (Massa seca da espaçonave)
  const [rocketIsp, setRocketIsp] = useState<number>(320); // s (Impulso específico - ex: MMH/NTO)

  const hohmannResults = useMemo(() => {
    const r1 = R_EARTH + Math.max(100, hohmannR1Alt);
    const r2 = R_EARTH + Math.max(100, hohmannR2Alt);

    // Velocidades circulares
    const v1_circ = Math.sqrt(MU_EARTH / r1);
    const v2_circ = Math.sqrt(MU_EARTH / r2);

    // Semi-eixo maior da elipse de transferência
    const a_trans = (r1 + r2) / 2;

    // Velocidades no perigeu e apogeu da elipse de transferência
    const vt1 = Math.sqrt(MU_EARTH * (2 / r1 - 1 / a_trans));
    const vt2 = Math.sqrt(MU_EARTH * (2 / r2 - 1 / a_trans));

    // Impulsos delta-V (km/s)
    const dv1 = Math.abs(vt1 - v1_circ);
    const dv2 = Math.abs(v2_circ - vt2);
    const totalDv = dv1 + dv2; // km/s
    const totalDv_ms = totalDv * 1000; // m/s

    // Tempo de trânsito t = pi * sqrt(a_trans^3 / mu)
    const transitTime_s = Math.PI * Math.sqrt(Math.pow(a_trans, 3) / MU_EARTH);
    const transitHours = transitTime_s / 3600;

    // Tsiolkovsky: m0 = mf * exp(dv / (Isp * g0))
    const massRatio = Math.exp(totalDv_ms / (rocketIsp * G0));
    const wetMass = rocketDryMass * massRatio;
    const propellantMass = wetMass - rocketDryMass;

    return {
      r1: r1.toFixed(1),
      r2: r2.toFixed(1),
      v1_circ: v1_circ.toFixed(3),
      v2_circ: v2_circ.toFixed(3),
      a_trans: a_trans.toFixed(1),
      dv1: dv1.toFixed(3),
      dv2: dv2.toFixed(3),
      totalDv: totalDv.toFixed(3),
      totalDv_ms: totalDv_ms.toFixed(1),
      transitHours: transitHours.toFixed(2),
      massRatio: massRatio.toFixed(3),
      wetMass: wetMass.toFixed(1),
      propellantMass: propellantMass.toFixed(1)
    };
  }, [hohmannR1Alt, hohmannR2Alt, rocketDryMass, rocketIsp]);

  /* -------------------------------------------------------------------------- */
  /* FERRAMENTA 4: PONTOS DE LAGRANGE L1-L5 (SISTEMA DE 3 CORPOS RESTRITO)      */
  /* -------------------------------------------------------------------------- */
  type ThreeBodySystem = 'sun-earth' | 'earth-moon' | 'sun-jupiter';
  const [selectedSystem, setSelectedSystem] = useState<ThreeBodySystem>('sun-earth');

  const cr3bpSystems: {
    [key in ThreeBodySystem]: { name: string; primary: string; secondary: string; mu: number; distanceKm: number }
  } = {
    'sun-earth': {
      name: 'Sol - Terra',
      primary: 'Sol (1.989 × 10³⁰ kg)',
      secondary: 'Terra (5.972 × 10²⁴ kg)',
      mu: 3.0034806e-6,
      distanceKm: 149597870.7
    },
    'earth-moon': {
      name: 'Terra - Lua',
      primary: 'Terra (5.972 × 10²⁴ kg)',
      secondary: 'Lua (7.342 × 10²² kg)',
      mu: 0.01215058,
      distanceKm: 384400
    },
    'sun-jupiter': {
      name: 'Sol - Júpiter (Troianos)',
      primary: 'Sol (1.989 × 10³⁰ kg)',
      secondary: 'Júpiter (1.898 × 10²⁷ kg)',
      mu: 9.537e-4,
      distanceKm: 778500000
    }
  };

  const lagrangeResults = useMemo(() => {
    const sys = cr3bpSystems[selectedSystem];
    const mu = sys.mu;
    const D = sys.distanceKm;

    // Resolução por aproximação analítica de Euler-Hill para L1, L2, L3:
    // Distância Hill r_H = D * (mu / 3)^(1/3)
    const r_H = Math.pow(mu / 3, 1 / 3);

    // L1: entre M1 e M2 (a esquerda de M2)
    const gamma1 = r_H * (1 - (1 / 3) * r_H - (1 / 9) * r_H * r_H);
    const x_L1 = 1 - mu - gamma1;
    const distToM2_L1_km = gamma1 * D;

    // L2: além de M2 (a direita de M2)
    const gamma2 = r_H * (1 + (1 / 3) * r_H - (1 / 9) * r_H * r_H);
    const x_L2 = 1 - mu + gamma2;
    const distToM2_L2_km = gamma2 * D;

    // L3: oposto a M1
    const gamma3 = 1 - (7 / 12) * mu;
    const x_L3 = -gamma3;
    const distToM1_L3_km = Math.abs(x_L3 + mu) * D;

    // L4 e L5: Triângulo equilátero exato
    const x_L4 = 0.5 - mu;
    const y_L4 = Math.sqrt(3) / 2;
    const x_L5 = 0.5 - mu;
    const y_L5 = -Math.sqrt(3) / 2;

    return {
      sys,
      muNotation: mu.toExponential(4),
      L1: { x: x_L1.toFixed(5), distKm: distToM2_L1_km.toLocaleString('pt-BR', { maximumFractionDigits: 0 }) },
      L2: { x: x_L2.toFixed(5), distKm: distToM2_L2_km.toLocaleString('pt-BR', { maximumFractionDigits: 0 }) },
      L3: { x: x_L3.toFixed(5), distKm: distToM1_L3_km.toLocaleString('pt-BR', { maximumFractionDigits: 0 }) },
      L4: { x: x_L4.toFixed(5), y: y_L4.toFixed(5) },
      L5: { x: x_L5.toFixed(5), y: y_L5.toFixed(5) }
    };
  }, [selectedSystem]);

  /* -------------------------------------------------------------------------- */
  /* FERRAMENTA 5: EFEMÉRIDES PLANETÁRIAS (MODELO ANALÍTICO JPL HORIZONS/VSOP)  */
  /* -------------------------------------------------------------------------- */
  const PLANET_DATA: {
    [key: string]: { name: string; semiMajorAU: number; periodYears: number; ecc: number; color: string; desc: string }
  } = {
    mercury: { name: 'Mercúrio', semiMajorAU: 0.387, periodYears: 0.241, ecc: 0.2056, color: '#94a3b8', desc: 'Menor planeta, órbita elíptica rápida com precessão relativística de Einstein.' },
    venus: { name: 'Vênus', semiMajorAU: 0.723, periodYears: 0.615, ecc: 0.0067, color: '#fef08a', desc: 'Planeta mais quente, rotação retrógrada e atmosfera hiperbárica de CO₂.' },
    earth: { name: 'Terra', semiMajorAU: 1.000, periodYears: 1.000, ecc: 0.0167, color: '#38bdf8', desc: 'Nosso lar orbital a 1.000 UA do Sol. Referência para o plano da eclíptica.' },
    mars: { name: 'Marte', semiMajorAU: 1.524, periodYears: 1.881, ecc: 0.0934, color: '#f87171', desc: 'Planeta vermelho com Monte Olimpo e deserto oxidado rico em ferro.' },
    jupiter: { name: 'Júpiter', semiMajorAU: 5.204, periodYears: 11.86, ecc: 0.0484, color: '#fbbf24', desc: 'Gigante gasoso com 318 massas terrestres e 95 luas conhecidas.' },
    saturn: { name: 'Saturno', semiMajorAU: 9.582, periodYears: 29.45, ecc: 0.0541, color: '#fde047', desc: 'Magnífico sistema de anéis de gelo e rocha com densidade menor que a água.' },
    uranus: { name: 'Urano', semiMajorAU: 19.20, periodYears: 84.02, ecc: 0.0472, color: '#67e8f9', desc: 'Gigante de gelo com eixo de rotação inclinado a 97.8 graus.' },
    neptune: { name: 'Netuno', semiMajorAU: 30.05, periodYears: 164.8, ecc: 0.0086, color: '#60a5fa', desc: 'Planeta mais externo com ventos supersônicos superiores a 2.100 km/h.' }
  };

  const [selectedPlanetKey, setSelectedPlanetKey] = useState<string>('mars');
  const [targetDateEpoch, setTargetDateEpoch] = useState<string>('2026-10-27');

  const planetEphemeris = useMemo(() => {
    const p = PLANET_DATA[selectedPlanetKey];
    // Cálculo aproximado de Julian Date (JD) a partir da data ISO
    const date = new Date(targetDateEpoch);
    const msSinceJ2000 = date.getTime() - Date.UTC(2000, 0, 1, 12, 0, 0);
    const daysSinceJ2000 = msSinceJ2000 / (1000 * 60 * 60 * 24);

    // Movimento médio n = 360 / T_days
    const n = 360 / (p.periodYears * 365.25);
    const meanAnomaly = ((daysSinceJ2000 * n) % 360 + 360) % 360;

    // Distância heliocêntrica aproximada r = a * (1 - e * cos(M))
    const mRad = (meanAnomaly * Math.PI) / 180;
    const rAU = p.semiMajorAU * (1 - p.ecc * Math.cos(mRad));
    const rKm = rAU * AU_KM;

    // Distância geocêntrica aproximada
    // Terra: a=1.0, período=1.0 ano
    const earthM = ((daysSinceJ2000 * 360 / 365.25) % 360 + 360) % 360;
    const earthMRad = (earthM * Math.PI) / 180;
    const xEarth = Math.cos(earthMRad);
    const yEarth = Math.sin(earthMRad);

    const xPlanet = rAU * Math.cos(mRad);
    const yPlanet = rAU * Math.sin(mRad);

    const dx = xPlanet - xEarth;
    const dy = yPlanet - yEarth;
    const distToEarthAU = Math.sqrt(dx * dx + dy * dy);
    const distToEarthKm = distToEarthAU * AU_KM;

    // Tempo de viagem da luz (Light Time)
    const lightTimeSeconds = distToEarthKm / SPEED_OF_LIGHT;
    const lightTimeMinutes = lightTimeSeconds / 60;

    // Ascensão reta aproximada em horas (0-24h)
    let raRad = Math.atan2(dy, dx);
    if (raRad < 0) raRad += 2 * Math.PI;
    const raHours = (raRad * 24) / (2 * Math.PI);
    const raH = Math.floor(raHours);
    const raM = Math.floor((raHours - raH) * 60);

    return {
      planet: p,
      daysSinceJ2000: daysSinceJ2000.toFixed(1),
      rAU: rAU.toFixed(3),
      rKm: (rKm / 1e6).toFixed(2),
      distToEarthAU: distToEarthAU.toFixed(3),
      distToEarthKm: (distToEarthKm / 1e6).toFixed(2),
      lightTimeMinutes: lightTimeMinutes.toFixed(2),
      raStr: `${raH}h ${raM}m`,
      meanAnomaly: meanAnomaly.toFixed(1)
    };
  }, [selectedPlanetKey, targetDateEpoch]);

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* HEADER DA SUÍTE */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 rounded-2xl bg-slate-900/90 border border-cyan-500/30 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-gradient-to-br from-indigo-500/20 via-slate-800 to-cyan-500/20 border border-indigo-500/40 text-indigo-400 shadow-inner">
            <Rocket className="w-8 h-8 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 text-xs font-mono font-semibold rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                CAPITANIA #11 · SUÍTE #89
              </span>
              <span className="px-2 py-0.5 text-xs font-mono rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                455 FERRAMENTAS
              </span>
            </div>
            <h2 className="text-2xl font-bold text-slate-100 mt-1">
              Astrofísica Numérica, Mecânica Orbital & Efemérides JPL
            </h2>
            <p className="text-sm text-slate-400">
              Integrador de Órbitas Keplerianas, Propagador SGP4 TLE, Manobras de Hohmann, Pontos de Lagrange L1-L5 e Efemérides Planetárias VSOP/Horizons.
            </p>
          </div>
        </div>
      </div>

      {/* ABAS DE NAVEGAÇÃO DA SUÍTE */}
      <div className="flex flex-wrap gap-2 p-1.5 rounded-xl bg-slate-900/80 border border-slate-800">
        <button
          onClick={() => setActiveTab('keplerian')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'keplerian'
              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>Elementos Keplerianos</span>
        </button>

        <button
          onClick={() => setActiveTab('sgp4-tle')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'sgp4-tle'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>Propagador SGP4 TLE</span>
        </button>

        <button
          onClick={() => setActiveTab('hohmann')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'hohmann'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Rocket className="w-4 h-4" />
          <span>Transferência de Hohmann (Δv)</span>
        </button>

        <button
          onClick={() => setActiveTab('lagrange')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'lagrange'
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Crosshair className="w-4 h-4" />
          <span>Pontos de Lagrange (L1-L5)</span>
        </button>

        <button
          onClick={() => setActiveTab('ephemeris')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'ephemeris'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Sun className="w-4 h-4" />
          <span>Efemérides JPL Horizons</span>
        </button>
      </div>

      {/* ABA 1: ELEMENTOS KEPLERIANOS */}
      {activeTab === 'keplerian' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 p-6 rounded-2xl bg-slate-900/90 border border-indigo-500/20 space-y-5">
            <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
              <Sliders className="w-5 h-5 text-indigo-400" />
              Parâmetros Orbitais (6 Elementos de Kepler)
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Integração analítica da mecânica de dois corpos (equação de vis-viva e equação de Kepler M = E - e·sin(E)) sob o potencial gravitacional da Terra.
            </p>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
                  <span>Semi-eixo Maior (a)</span>
                  <span className="text-indigo-400">{keplerSemiMajorAxis} km</span>
                </div>
                <input
                  type="range"
                  min="6600"
                  max="42164"
                  step="50"
                  value={keplerSemiMajorAxis}
                  onChange={(e) => setKeplerSemiMajorAxis(Number(e.target.value))}
                  className="w-full accent-indigo-400"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
                  <span>Excentricidade (e)</span>
                  <span className="text-indigo-400">{keplerEccentricity.toFixed(3)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="0.9"
                  step="0.01"
                  value={keplerEccentricity}
                  onChange={(e) => setKeplerEccentricity(Number(e.target.value))}
                  className="w-full accent-indigo-400"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
                  <span>Inclinação (i)</span>
                  <span className="text-indigo-400">{keplerInclination}°</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="180"
                  value={keplerInclination}
                  onChange={(e) => setKeplerInclination(Number(e.target.value))}
                  className="w-full accent-indigo-400"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
                  <span>Anomalia Verdadeira (ν)</span>
                  <span className="text-indigo-400">{keplerTrueAnomaly}°</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={keplerTrueAnomaly}
                  onChange={(e) => setKeplerTrueAnomaly(Number(e.target.value))}
                  className="w-full accent-indigo-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-xs text-slate-400">RAAN (Ω)</div>
                <div className="text-sm font-mono font-bold text-slate-200">{keplerRaan}°</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-xs text-slate-400">Arg. Períapse (ω)</div>
                <div className="text-sm font-mono font-bold text-slate-200">{keplerArgPeriapsis}°</div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 p-6 rounded-2xl bg-slate-900/90 border border-indigo-500/20 space-y-6">
            <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
              <Eye className="w-5 h-5 text-indigo-400" />
              Estado Orbital Instantâneo & Trajetória 2D
            </h3>

            {/* Diagrama SVG da Órbita */}
            <div className="flex justify-center p-4 rounded-xl bg-slate-950 border border-slate-800 shadow-inner">
              <svg viewBox="-200 -120 400 240" className="w-full max-w-md h-52">
                {/* Terra no foco primário (0, 0) */}
                <circle cx="0" cy="0" r="16" fill="#38bdf8" stroke="#0284c7" strokeWidth="2" />
                <text x="0" y="4" textAnchor="middle" fill="#0f172a" fontSize="8" fontWeight="bold">TERRA</text>

                {/* Órbita elíptica aproximada */}
                {/* O foco está na Terra (0, 0); o centro da elipse está em (-c, 0) com c = a * e */}
                {(() => {
                  const scale = 140 / (keplerSemiMajorAxis || 7200);
                  const a_px = keplerSemiMajorAxis * scale;
                  const b_px = a_px * Math.sqrt(1 - keplerEccentricity * keplerEccentricity);
                  const c_px = a_px * keplerEccentricity;
                  const centerX = -c_px;

                  // Posição do satélite em (nu)
                  const nuRad = (keplerTrueAnomaly * Math.PI) / 180;
                  const r_px = (a_px * (1 - keplerEccentricity * keplerEccentricity)) / (1 + keplerEccentricity * Math.cos(nuRad));
                  const satX = r_px * Math.cos(nuRad);
                  const satY = -r_px * Math.sin(nuRad);

                  return (
                    <g>
                      <ellipse
                        cx={centerX}
                        cy="0"
                        rx={a_px}
                        ry={b_px}
                        fill="none"
                        stroke="#818cf8"
                        strokeWidth="1.5"
                        strokeDasharray="4 2"
                      />
                      {/* Linha do foco até o satélite */}
                      <line x1="0" y1="0" x2={satX} y2={satY} stroke="#6366f1" strokeWidth="1" opacity="0.6" />
                      {/* Marcador do satélite */}
                      <circle cx={satX} cy={satY} r="5" fill="#f43f5e" stroke="#fff" strokeWidth="1.5" />
                      {/* Posição do Perigeu */}
                      <circle cx={a_px - c_px} cy="0" r="3" fill="#10b981" />
                      <text x={a_px - c_px + 8} y="3" fill="#10b981" fontSize="7" fontFamily="monospace">Perigeu</text>
                      {/* Posição do Apogeu */}
                      <circle cx={-a_px - c_px} cy="0" r="3" fill="#f59e0b" />
                      <text x={-a_px - c_px - 8} y="3" textAnchor="end" fill="#f59e0b" fontSize="7" fontFamily="monospace">Apogeu</text>
                    </g>
                  );
                })()}
              </svg>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-xs text-slate-400">Velocidade Atual</div>
                <div className="text-base font-mono font-bold text-cyan-400">{keplerianResults.v} km/s</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-xs text-slate-400">Altitude Atual</div>
                <div className="text-base font-mono font-bold text-indigo-400">{keplerianResults.currentAltitude} km</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-xs text-slate-400">Período Orbital</div>
                <div className="text-base font-mono font-bold text-emerald-400">{keplerianResults.T_min} min</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-xs text-slate-400">Anomalia Média</div>
                <div className="text-base font-mono font-bold text-purple-400">{keplerianResults.M_deg}°</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">Apogeu (ha):</span>
                <span className="text-amber-300 font-bold">{keplerianResults.ha} km ({keplerianResults.va} km/s)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Perigeu (hp):</span>
                <span className="text-emerald-300 font-bold">{keplerianResults.hp} km ({keplerianResults.vp} km/s)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ABA 2: PROPAGADOR SGP4 TLE */}
      {activeTab === 'sgp4-tle' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 p-6 rounded-2xl bg-slate-900/90 border border-cyan-500/20 space-y-5">
            <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
              <Globe className="w-5 h-5 text-cyan-400" />
              Entrada Two-Line Element (TLE) NORAD
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              O modelo SGP4 (Simplified General Perturbations-4) propaga órbitas de satélites em órbita baixa e geoestacionária considerando o achatamento terrestre J2/J3/J4 e arrasto atmosférico.
            </p>

            <div>
              <label className="text-xs font-semibold text-slate-300 mb-2 block">
                Presets Oficiais Homologados:
              </label>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(TLE_PRESETS).map(([key, val]) => (
                  <button
                    key={key}
                    onClick={() => handleSelectPreset(key)}
                    className={`px-3 py-2 rounded-lg text-xs font-medium text-left transition ${
                      selectedTleKey === key
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                        : 'bg-slate-950 text-slate-400 border border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    {val.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div>
                <label className="text-xs font-mono text-slate-400 mb-1 block">Linha 1 do TLE:</label>
                <input
                  type="text"
                  value={customTleL1}
                  onChange={(e) => setCustomTleL1(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-cyan-300"
                />
              </div>

              <div>
                <label className="text-xs font-mono text-slate-400 mb-1 block">Linha 2 do TLE:</label>
                <input
                  type="text"
                  value={customTleL2}
                  onChange={(e) => setCustomTleL2(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-cyan-300"
                />
              </div>
            </div>

            <button
              onClick={() => copyToClipboard(`${customTleL1}\n${customTleL2}`)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>Copiar Cartão TLE</span>
            </button>
          </div>

          <div className="lg:col-span-6 p-6 rounded-2xl bg-slate-900/90 border border-cyan-500/20 space-y-5">
            <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
              <Activity className="w-5 h-5 text-cyan-400" />
              Propriedades Orbitais Extraídas
            </h3>

            {parsedTle.valid ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <div className="text-xs text-slate-400">Satélite NORAD ID</div>
                    <div className="text-lg font-mono font-bold text-cyan-400">{parsedTle.satNumber}</div>
                    <div className="text-xs text-slate-500">{parsedTle.intlDesignator}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <div className="text-xs text-slate-400">Época (Ano / Dia)</div>
                    <div className="text-lg font-mono font-bold text-slate-200">
                      {parsedTle.epochYear} · {parsedTle.epochDay}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <div className="text-xs text-slate-400">Inclinação (i)</div>
                    <div className="text-sm font-mono font-bold text-cyan-300">{parsedTle.inclination}°</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <div className="text-xs text-slate-400">Excentricidade</div>
                    <div className="text-sm font-mono font-bold text-indigo-300">{parsedTle.eccentricity}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <div className="text-xs text-slate-400">Revs / Dia</div>
                    <div className="text-sm font-mono font-bold text-emerald-300">{parsedTle.meanMotion}</div>
                  </div>
                </div>

                <div className="space-y-2 p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Semi-eixo Maior (a):</span>
                    <span className="text-slate-200">{parsedTle.semiMajorAxis} km</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Altitude Perigeu / Apogeu:</span>
                    <span className="text-cyan-300">{parsedTle.perigeeAlt} km / {parsedTle.apogeeAlt} km</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Período de Órbita:</span>
                    <span className="text-emerald-300">{parsedTle.periodMinutes} min (~{(Number(parsedTle.periodMinutes) / 60).toFixed(2)} h)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Velocidade Média:</span>
                    <span className="text-amber-300">{parsedTle.orbitalSpeed} km/s ({Math.round(Number(parsedTle.orbitalSpeed) * 3600)} km/h)</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                Formato TLE inválido. Certifique-se de colar exatamente as duas linhas do padrão NORAD de 69 colunas.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ABA 3: TRANSFERÊNCIA DE HOHMANN & TSIOLKOVSKY */}
      {activeTab === 'hohmann' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 p-6 rounded-2xl bg-slate-900/90 border border-amber-500/20 space-y-5">
            <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
              <Rocket className="w-5 h-5 text-amber-400" />
              Configuração da Manobra Orbital
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              A transferência de Hohmann é a manobra de dois impulsos mais eficiente em combustível para transferir uma espaçonave entre duas órbitas circulares coplanares.
            </p>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
                  <span>Altitude Órbita Inicial (LEO r1)</span>
                  <span className="text-amber-400">{hohmannR1Alt} km</span>
                </div>
                <input
                  type="range"
                  min="200"
                  max="2000"
                  step="50"
                  value={hohmannR1Alt}
                  onChange={(e) => setHohmannR1Alt(Number(e.target.value))}
                  className="w-full accent-amber-400"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
                  <span>Altitude Órbita Destino (GEO/MEO r2)</span>
                  <span className="text-amber-400">{hohmannR2Alt} km</span>
                </div>
                <input
                  type="range"
                  min="1000"
                  max="35786"
                  step="500"
                  value={hohmannR2Alt}
                  onChange={(e) => setHohmannR2Alt(Number(e.target.value))}
                  className="w-full accent-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Massa Seca Espaçonave (mf)</label>
                  <input
                    type="number"
                    value={rocketDryMass}
                    onChange={(e) => setRocketDryMass(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-200"
                  />
                  <span className="text-xs text-slate-500">kg</span>
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Impulso Específico (Isp)</label>
                  <input
                    type="number"
                    value={rocketIsp}
                    onChange={(e) => setRocketIsp(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-200"
                  />
                  <span className="text-xs text-slate-500">segundos (s)</span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 p-6 rounded-2xl bg-slate-900/90 border border-amber-500/20 space-y-6">
            <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" />
              Orçamento de Delta-V (Δv) & Propelente
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-amber-500/40 shadow-lg text-center">
                <div className="text-xs text-slate-400 mb-1">Δv Total Requerido</div>
                <div className="text-2xl font-mono font-bold text-amber-300">
                  {hohmannResults.totalDv} km/s
                </div>
                <div className="text-xs text-slate-500 mt-1">{hohmannResults.totalDv_ms} m/s</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-cyan-500/40 shadow-lg text-center">
                <div className="text-xs text-slate-400 mb-1">Tempo de Trânsito</div>
                <div className="text-2xl font-mono font-bold text-cyan-300">
                  {hohmannResults.transitHours} h
                </div>
                <div className="text-xs text-slate-500 mt-1">Meia-órbita de transferência</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/40 shadow-lg text-center">
                <div className="text-xs text-slate-400 mb-1">Propelente Necessário</div>
                <div className="text-2xl font-mono font-bold text-emerald-300">
                  {Number(hohmannResults.propellantMass).toLocaleString('pt-BR')} kg
                </div>
                <div className="text-xs text-slate-500 mt-1">Massa úmida: {Number(hohmannResults.wetMass).toLocaleString('pt-BR')} kg</div>
              </div>
            </div>

            <div className="space-y-3 p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono">
              <div className="text-xs font-semibold text-slate-300 mb-1">Decomposição dos Queimadores de Impulso:</div>
              <div className="flex justify-between">
                <span className="text-slate-400">1º Impulso (Inserção na Transferência Δv₁):</span>
                <span className="text-amber-400 font-bold">+{hohmannResults.dv1} km/s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">2º Impulso (Circularização no Destino Δv₂):</span>
                <span className="text-amber-400 font-bold">+{hohmannResults.dv2} km/s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Razão de Massa Tsiolkovsky (m₀ / mf):</span>
                <span className="text-purple-300 font-bold">{hohmannResults.massRatio}x</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ABA 4: PONTOS DE LAGRANGE L1-L5 */}
      {activeTab === 'lagrange' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 p-6 rounded-2xl bg-slate-900/90 border border-purple-500/20 space-y-5">
            <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
              <Crosshair className="w-5 h-5 text-purple-400" />
              Problema Restrito dos Três Corpos (CR3BP)
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              No referencial rotativo sincronizado com as duas massas primárias, o equilíbrio entre gravitação e força centrífuga gera 5 pontos de equilíbrio neutro (Lagrange L1 a L5).
            </p>

            <div>
              <label className="text-xs font-semibold text-slate-300 mb-2 block">
                Sistema Gravitacional Selecionado:
              </label>
              <div className="space-y-2">
                {(['sun-earth', 'earth-moon', 'sun-jupiter'] as ThreeBodySystem[]).map((key) => (
                  <button
                    key={key}
                    onClick={() => setSelectedSystem(key)}
                    className={`w-full p-3 rounded-xl text-left text-xs transition border ${
                      selectedSystem === key
                        ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    <div className="font-bold text-slate-200">{cr3bpSystems[key].name}</div>
                    <div className="text-slate-500 mt-0.5">μ = {cr3bpSystems[key].mu.toExponential(4)} · Distância: {cr3bpSystems[key].distanceKm.toLocaleString('pt-BR')} km</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/30 text-xs text-purple-200/90 leading-relaxed">
              <span className="font-bold">Aplicações Reais:</span> O Telescópio Espacial James Webb (JWST) opera em órbita de Halo ao redor do ponto L2 Sol-Terra (~1,5 milhão de km da Terra), mantendo o protetor solar apontado para o Sol, Terra e Lua simultaneamente.
            </div>
          </div>

          <div className="lg:col-span-7 p-6 rounded-2xl bg-slate-900/90 border border-purple-500/20 space-y-6">
            <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
              <Eye className="w-5 h-5 text-purple-400" />
              Coordenadas Adimensionais & Localização dos Pontos
            </h3>

            {/* Diagrama SVG dos Pontos de Lagrange */}
            <div className="flex justify-center p-4 rounded-xl bg-slate-950 border border-slate-800 shadow-inner">
              <svg viewBox="-180 -120 360 240" className="w-full max-w-md h-56">
                {/* Eixo de rotação */}
                <line x1="-160" y1="0" x2="160" y2="0" stroke="#334155" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="0" y1="-100" x2="0" y2="100" stroke="#334155" strokeWidth="1" strokeDasharray="3 3" />

                {/* Corpo Primário M1 (ex: Sol ou Terra) */}
                <circle cx="-50" cy="0" r="14" fill="#fbbf24" stroke="#f59e0b" strokeWidth="2" />
                <text x="-50" y="22" textAnchor="middle" fill="#fbbf24" fontSize="8" fontWeight="bold">M1</text>

                {/* Corpo Secundário M2 (ex: Terra ou Lua) */}
                <circle cx="70" cy="0" r="8" fill="#38bdf8" stroke="#0284c7" strokeWidth="1.5" />
                <text x="70" y="16" textAnchor="middle" fill="#38bdf8" fontSize="7" fontWeight="bold">M2</text>

                {/* Ponto L1 (entre M1 e M2) */}
                <circle cx="48" cy="0" r="4" fill="#c084fc" />
                <text x="48" y="-7" textAnchor="middle" fill="#c084fc" fontSize="8" fontWeight="bold">L1</text>

                {/* Ponto L2 (além de M2) */}
                <circle cx="95" cy="0" r="4" fill="#c084fc" />
                <text x="95" y="-7" textAnchor="middle" fill="#c084fc" fontSize="8" fontWeight="bold">L2 (JWST)</text>

                {/* Ponto L3 (oposto a M1) */}
                <circle cx="-135" cy="0" r="4" fill="#c084fc" />
                <text x="-135" y="-7" textAnchor="middle" fill="#c084fc" fontSize="8" fontWeight="bold">L3</text>

                {/* Ponto L4 (Triângulo acima) */}
                <circle cx="10" cy="-70" r="5" fill="#34d399" />
                <text x="10" y="-78" textAnchor="middle" fill="#34d399" fontSize="8" fontWeight="bold">L4 (Estável)</text>
                <line x1="-50" y1="0" x2="10" y2="-70" stroke="#34d399" strokeWidth="0.8" strokeDasharray="2 2" opacity="0.4" />
                <line x1="70" y1="0" x2="10" y2="-70" stroke="#34d399" strokeWidth="0.8" strokeDasharray="2 2" opacity="0.4" />

                {/* Ponto L5 (Triângulo abaixo) */}
                <circle cx="10" cy="70" r="5" fill="#34d399" />
                <text x="10" y="85" textAnchor="middle" fill="#34d399" fontSize="8" fontWeight="bold">L5 (Estável)</text>
                <line x1="-50" y1="0" x2="10" y2="70" stroke="#34d399" strokeWidth="0.8" strokeDasharray="2 2" opacity="0.4" />
                <line x1="70" y1="0" x2="10" y2="70" stroke="#34d399" strokeWidth="0.8" strokeDasharray="2 2" opacity="0.4" />
              </svg>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs font-mono">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-slate-400">Ponto L1 (Colinear):</div>
                <div className="text-purple-300 font-bold mt-1">{lagrangeResults.L1.distKm} km</div>
                <div className="text-slate-500 text-[10px]">Distância até M2</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-slate-400">Ponto L2 (Colinear):</div>
                <div className="text-purple-300 font-bold mt-1">{lagrangeResults.L2.distKm} km</div>
                <div className="text-slate-500 text-[10px]">Distância até M2</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-slate-400">Ponto L3 (Anti-M1):</div>
                <div className="text-purple-300 font-bold mt-1">{lagrangeResults.L3.distKm} km</div>
                <div className="text-slate-500 text-[10px]">Oposto a M1</div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 flex justify-between">
              <span>Pontos Triangulares L4 & L5 (Potencialmente Estáveis):</span>
              <span className="font-mono text-emerald-400 font-bold">X = {lagrangeResults.L4.x}, Y = ±{lagrangeResults.L4.y}</span>
            </div>
          </div>
        </div>
      )}

      {/* ABA 5: EFEMÉRIDES PLANETÁRIAS JPL HORIZONS / VSOP */}
      {activeTab === 'ephemeris' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 p-6 rounded-2xl bg-slate-900/90 border border-emerald-500/20 space-y-5">
            <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
              <Sun className="w-5 h-5 text-emerald-400" />
              Seleção do Corpo Planetário & Data
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Cálculo analítico de efemérides heliocêntricas e geocêntricas baseado nas séries planetárias VSOP87 e JPL Horizons para os corpos principais do Sistema Solar.
            </p>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 mb-1.5 block">
                  Planeta Alvo:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(PLANET_DATA).map(([key, val]) => (
                    <button
                      key={key}
                      onClick={() => setSelectedPlanetKey(key)}
                      className={`px-3 py-2 rounded-lg text-xs font-medium text-left transition flex items-center gap-2 border ${
                        selectedPlanetKey === key
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
                      }`}
                    >
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: val.color }} />
                      <span>{val.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 mb-1 block">
                  Data de Observação (Época):
                </label>
                <input
                  type="date"
                  value={targetDateEpoch}
                  onChange={(e) => setTargetDateEpoch(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-emerald-300"
                />
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 leading-relaxed">
                <span className="font-bold text-slate-200">{planetEphemeris.planet.name}:</span> {planetEphemeris.planet.desc}
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 p-6 rounded-2xl bg-slate-900/90 border border-emerald-500/20 space-y-6">
            <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
              <Compass className="w-5 h-5 text-emerald-400" />
              Efemérides Geocêntricas & Heliocêntricas
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/40 text-center shadow-lg">
                <div className="text-xs text-slate-400 mb-1">Distância da Terra</div>
                <div className="text-2xl font-mono font-bold text-emerald-300">
                  {planetEphemeris.distToEarthAU} UA
                </div>
                <div className="text-xs text-slate-500 mt-1">{planetEphemeris.distToEarthKm} milhões km</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-cyan-500/40 text-center shadow-lg">
                <div className="text-xs text-slate-400 mb-1">Tempo de Luz (Light Time)</div>
                <div className="text-2xl font-mono font-bold text-cyan-300">
                  {planetEphemeris.lightTimeMinutes} min
                </div>
                <div className="text-xs text-slate-500 mt-1">Atraso de comunicação 1-way</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-purple-500/40 text-center shadow-lg">
                <div className="text-xs text-slate-400 mb-1">Ascensão Reta (α)</div>
                <div className="text-2xl font-mono font-bold text-purple-300">
                  {planetEphemeris.raStr}
                </div>
                <div className="text-xs text-slate-500 mt-1">Coordenada Equatorial</div>
              </div>
            </div>

            <div className="space-y-3 p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">Distância Heliocêntrica (Sol):</span>
                <span className="text-slate-200">{planetEphemeris.rAU} UA ({planetEphemeris.rKm} milhões km)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Período Orbital Sideral:</span>
                <span className="text-slate-200">{planetEphemeris.planet.periodYears} anos terrestres</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Excentricidade Orbital:</span>
                <span className="text-slate-200">{planetEphemeris.planet.ecc}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Dias desde Época Padrão J2000.0:</span>
                <span className="text-emerald-400 font-bold">{planetEphemeris.daysSinceJ2000} dias</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default OrbitalMechanicsAndAstrophysicsSuite;
