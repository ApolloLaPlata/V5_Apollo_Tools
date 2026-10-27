'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Orbit,
  Waves,
  Clock,
  Eye,
  Aperture,
  Sparkles,
  Copy,
  Check,
  RotateCcw,
  Sliders,
  Activity,
  Flame,
  Circle,
  BarChart2,
  Maximize2,
  Crosshair,
  Compass,
  Zap,
  Globe,
  Radio,
  Share2,
  Info
} from 'lucide-react';

export function GeneralRelativityAndGravitationalWavesSuite({
  defaultTab = 'black-hole-geometry'
}: {
  defaultTab?: string;
}) {
  const [activeTab, setActiveTab] = useState<
    'black-hole-geometry' | 'geodesic-precession' | 'time-dilation-redshift' | 'gravitational-lensing' | 'gravitational-waves'
  >(() => {
    if (defaultTab === 'relativistic-geodesic-perihelion-precession-tool' || defaultTab === 'geodesic-precession') return 'geodesic-precession';
    if (defaultTab === 'gravitational-redshift-time-dilation-tool' || defaultTab === 'time-dilation-redshift') return 'time-dilation-redshift';
    if (defaultTab === 'gravitational-lensing-einstein-ring-tool' || defaultTab === 'gravitational-lensing') return 'gravitational-lensing';
    if (defaultTab === 'gravitational-wave-chirp-mass-calc-tool' || defaultTab === 'gravitational-waves') return 'gravitational-waves';
    return 'black-hole-geometry';
  });

  const [copied, setCopied] = useState(false);
  const copyToClipboard = (text: string) => {
    try { if (navigator.clipboard?.writeText) navigator.clipboard.writeText(text).catch(() => {}); } catch {}
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  /* Constantes Fundamentais */
  const G = 6.67430e-11; // m^3 / (kg s^2)
  const c = 2.99792458e8; // m/s
  const M_SUN = 1.98847e30; // kg
  const HBAR = 1.054571817e-34; // J s
  const K_B = 1.380649e-23; // J / K
  const PC_IN_METERS = 3.085677581e16; // m
  const MPC_IN_METERS = 3.085677581e22; // m
  const ARCSEC_TO_RAD = Math.PI / (180 * 3600);

  /* -------------------------------------------------------------------------- */
  /* FERRAMENTA 1: CALCULADOR DE GEOMETRIA DE BURACOS NEGROS (SCHWARZSCHILD/KERR) */
  /* -------------------------------------------------------------------------- */
  const [bhMassSolar, setBhMassSolar] = useState<number>(4.3e6); // Sgr A*
  const [bhSpin, setBhSpin] = useState<number>(0.90); // a* in [-0.999, 0.999]

  const bhPresets = [
    { label: 'Sagittário A* (Centro Galáctico)', mass: 4.3e6, spin: 0.90, desc: 'Buraco negro supermassivo no centro da Via Láctea' },
    { label: 'M87* (Galáxia Virgo A)', mass: 6.5e9, spin: 0.94, desc: 'Primeiro buraco negro fotografado pelo Event Horizon Telescope' },
    { label: 'Cygnus X-1 (Binária de Raio-X)', mass: 21.2, spin: 0.998, desc: 'Buraco negro de massa estelar com rotação quase extrema' },
    { label: 'GW150914 Remanescente', mass: 62.0, spin: 0.68, desc: 'Buraco negro resultante da primeira fusão detectada pelo LIGO' },
    { label: 'Massa Terrestre Teórica', mass: 5.972e24 / M_SUN, spin: 0.0, desc: 'Se a Terra fosse comprimida em um buraco negro (~8.87 mm de raio)' },
    { label: 'Buraco Negro Primordial (10^12 kg)', mass: 1e12 / M_SUN, spin: 0.0, desc: 'Possível candidato à matéria escura primordial evaporando no presente' }
  ];

  const bhGeometry = useMemo(() => {
    const M_kg = bhMassSolar * M_SUN;
    const a_star = Math.max(-0.9999, Math.min(0.9999, bhSpin));
    const Rg = (G * M_kg) / (c * c); // Raio gravitacional GM/c^2
    const Rs = 2 * Rg; // Raio de Schwarzschild

    // Horizonte de Kerr
    const r_plus = Rg * (1 + Math.sqrt(1 - a_star * a_star));
    const r_minus = Rg * (1 - Math.sqrt(1 - a_star * a_star));

    // Esfera de Fótons (Prógrada e Retrógrada)
    const sign = a_star >= 0 ? 1 : -1;
    const abs_a = Math.abs(a_star);
    const r_ph_pro = 2 * Rg * (1 + Math.cos((2 / 3) * Math.acos(-abs_a)));
    const r_ph_retro = 2 * Rg * (1 + Math.cos((2 / 3) * Math.acos(abs_a)));

    // ISCO (Innermost Stable Circular Orbit) - Bardeen et al.
    const z1 = 1 + Math.pow(1 - a_star * a_star, 1 / 3) * (Math.pow(1 + a_star, 1 / 3) + Math.pow(1 - a_star, 1 / 3));
    const z2 = Math.sqrt(3 * a_star * a_star + z1 * z1);
    const isco_sign = a_star >= 0 ? 1 : -1;
    const r_isco = Rg * (3 + z2 - isco_sign * Math.sqrt(Math.max(0, (3 - z1) * (3 + z1 + 2 * z2))));

    // Termodinâmica Hawking
    const area = 4 * Math.PI * (r_plus * r_plus + (a_star * Rg) * (a_star * Rg));
    const kappa = Math.sqrt(1 - a_star * a_star) / (2 * (r_plus / Rg) * (1 + Math.sqrt(1 - a_star * a_star))); // gravidade de superfície adimensional
    const surf_grav = (c * c * kappa) / Rg;
    const T_hawking = (HBAR * surf_grav) / (2 * Math.PI * c * K_B);

    // Entropia de Bekenstein-Hawking (S / k_B)
    const l_planck_sq = (HBAR * G) / (c * c * c);
    const entropy_adim = area / (4 * l_planck_sq);

    // Tempo de evaporação (anos) aproximado para Schwarzschild
    const t_evap_sec = (5120 * Math.PI * G * G * Math.pow(M_kg, 3)) / (HBAR * Math.pow(c, 4));
    const t_evap_years = t_evap_sec / (365.25 * 86400);

    return {
      M_kg,
      Rg,
      Rs,
      r_plus,
      r_minus,
      r_ph_pro,
      r_ph_retro,
      r_isco,
      area,
      T_hawking,
      entropy_adim,
      t_evap_years
    };
  }, [bhMassSolar, bhSpin]);

  /* -------------------------------------------------------------------------- */
  /* FERRAMENTA 2: SIMULADOR DE GEODÉSICAS & PRECESSÃO DO PERIÉLIO DE EINSTEIN  */
  /* -------------------------------------------------------------------------- */
  const [centralMassSolar, setCentralMassSolar] = useState<number>(1.0); // Sol
  const [semiMajorAxisAU, setSemiMajorAxisAU] = useState<number>(0.3871); // Mercúrio
  const [eccentricity, setEccentricity] = useState<number>(0.2056);
  const [relCouplingMult, setRelCouplingMult] = useState<number>(1.0); // Amplificador visual de precessão

  const orbitPresets = [
    { label: 'Mercúrio (Sol)', mass: 1.0, a: 0.3871, e: 0.2056, mult: 1, desc: 'Precessão histórica comprovada de 42.98 arcsec por século' },
    { label: 'Estrela S2 (Sgr A*)', mass: 4.3e6, a: 970, e: 0.884, mult: 1, desc: 'Avanço relativístico do periastro observado pelo VLT GRAVITY (12.1 min por órbita)' },
    { label: 'Púlsar Binário Hulse-Taylor', mass: 2.828, a: 0.013, e: 0.617, mult: 1, desc: 'Precessão estelar extrema de 4.22 graus por ano' },
    { label: 'Roseta Relativística Extrema (Demonstração)', mass: 10, a: 0.00008, e: 0.5, mult: 500, desc: 'Campo gravitacional ultra-forte com órbita em flor visível instantaneamente' },
    { label: 'Deflexão de Luz Tangente ao Sol', mass: 1.0, a: 0.00465, e: 0.999, mult: 1, desc: 'Desvio de 1.751 arcsec medido na expedição de Sobral em 1919' }
  ];

  const precessionData = useMemo(() => {
    const M_kg = centralMassSolar * M_SUN;
    const AU = 1.495978707e11; // m
    const a_m = semiMajorAxisAU * AU;
    const e = Math.max(0.001, Math.min(0.99, eccentricity));

    // Período Kepleriano
    const P_sec = 2 * Math.PI * Math.sqrt(Math.pow(a_m, 3) / (G * M_kg));
    const P_years = P_sec / (365.25 * 86400);

    // Precessão analítica de Einstein por órbita: delta_phi = (6 * pi * G * M) / (a * (1 - e^2) * c^2)
    const delta_phi_rad_per_orbit = (6 * Math.PI * G * M_kg) / (a_m * (1 - e * e) * c * c);
    const delta_phi_arcsec_per_orbit = delta_phi_rad_per_orbit * (180 * 3600 / Math.PI);
    const orbits_per_century = 100 / P_years;
    const precession_arcsec_century = delta_phi_arcsec_per_orbit * orbits_per_century;

    // Desvio gravitacional da luz na distância do periélio r_peri = a*(1-e)
    const r_peri = a_m * (1 - e);
    const light_deflection_rad = (4 * G * M_kg) / (r_peri * c * c);
    const light_deflection_arcsec = light_deflection_rad * (180 * 3600 / Math.PI);

    // Geração de pontos para plot 2D da trajetória de precessão (3 voltas)
    const points: { x: number; y: number }[] = [];
    const numOrbits = 3;
    const steps = 300;
    const visualShift = (delta_phi_rad_per_orbit * relCouplingMult);

    for (let i = 0; i <= steps; i++) {
      const theta = (i / steps) * (numOrbits * 2 * Math.PI);
      const orbitIndex = Math.floor(theta / (2 * Math.PI));
      const phase = theta % (2 * Math.PI);
      const rotatedPhase = phase;
      const r = (1 - e * e) / (1 + e * Math.cos(rotatedPhase));
      const totalAngle = theta + orbitIndex * visualShift;
      const x = r * Math.cos(totalAngle);
      const y = r * Math.sin(totalAngle);
      points.push({ x, y });
    }

    return {
      P_years,
      delta_phi_arcsec_per_orbit,
      precession_arcsec_century,
      light_deflection_arcsec,
      points,
      r_peri_km: r_peri / 1000
    };
  }, [centralMassSolar, semiMajorAxisAU, eccentricity, relCouplingMult]);

  /* -------------------------------------------------------------------------- */
  /* FERRAMENTA 3: DILATAÇÃO GRAVITACIONAL DO TEMPO & REDSHIFT (GPS / RELATIVIDADE) */
  /* -------------------------------------------------------------------------- */
  const [sourceMassKg, setSourceMassKg] = useState<number>(5.9722e24); // Terra
  const [sourceRadiusM, setSourceRadiusM] = useState<number>(6.371e6); // Raio Terra
  const [clockAltitudeKm, setClockAltitudeKm] = useState<number>(20180); // GPS
  const [clockSpeedKmS, setClockSpeedKmS] = useState<number>(3.874); // Velocidade orbital GPS

  const timePresets = [
    { label: 'Satélite GPS (Constelação NAVSTAR)', mass: 5.9722e24, r: 6.371e6, alt: 20180, v: 3.874, desc: 'Correção real de +38.6 microssegundos/dia para precisão métrica' },
    { label: 'Estação Espacial Internacional (ISS - LEO)', mass: 5.9722e24, r: 6.371e6, alt: 408, v: 7.66, desc: 'Velocidade alta domina: relógio na ISS atrasa -28.6 microssegundos/dia' },
    { label: 'Superfície do Sol (Fótons Emergentes)', mass: 1.98847e30, r: 6.9634e8, alt: 0, v: 0, desc: 'Redshift gravitacional solar medido por espectroscopia solar' },
    { label: 'Estrela de Nêutrons (Pulsar Superficial)', mass: 1.4 * 1.98847e30, r: 12000, alt: 0, v: 0, desc: 'Campo extremo: tempo corre 22% mais lento que no infinito' },
    { label: 'Horizonte Buraco Negro (1.05 Rs)', mass: 10 * 1.98847e30, r: (2 * 6.6743e-11 * 10 * 1.98847e30) / (9e16) * 1.05, alt: 0, v: 0, desc: 'Congelamento temporal asintótico visto por observador distante' }
  ];

  const timeDilationData = useMemo(() => {
    const M = sourceMassKg;
    const r_ground = sourceRadiusM;
    const r_clock = sourceRadiusM + clockAltitudeKm * 1000;
    const v = clockSpeedKmS * 1000;

    const Rs = (2 * G * M) / (c * c);

    // Fator gravitacional na superfície e na órbita
    const safe_rg = Math.max(0.0001, 1 - Rs / r_ground);
    const safe_ro = Math.max(0.0001, 1 - Rs / r_clock);
    const dtau_dt_ground = Math.sqrt(safe_rg);
    const dtau_dt_clock_grav = Math.sqrt(safe_ro);

    // Efeito Relatividade Geral (RG): diferença entre órbita e superfície (segundos por dia)
    // dtau_orbit / dtau_ground = sqrt(safe_ro / safe_rg)
    const gr_ratio = Math.sqrt(safe_ro / safe_rg);
    const gr_shift_us_day = (gr_ratio - 1) * 86400 * 1e6;

    // Efeito Relatividade Especial (RE - Cinemática de Lorentz): sqrt(1 - v^2/c^2)
    const beta = Math.min(0.99999, v / c);
    const gamma_inv = Math.sqrt(1 - beta * beta);
    const sr_shift_us_day = (gamma_inv - 1) * 86400 * 1e6;

    // Desvio Líquido diário
    const net_shift_us_day = gr_shift_us_day + sr_shift_us_day;
    // Erro acumulado em posicionamento por dia se não corrigido: delta_t * c
    const pos_drift_km_day = (Math.abs(net_shift_us_day) * 1e-6 * c) / 1000;

    // Redshift gravitacional z para fóton saindo de r_ground para o infinito
    const z_grav = (1 / dtau_dt_ground) - 1;

    // Atraso temporal de Shapiro teórico para sinal passando a 1 raio de distância
    const shapiro_delay_us = ((4 * G * M) / Math.pow(c, 3)) * (Math.log(4 * (r_ground + 1e8) * (r_clock + 1e8) / (r_ground * r_ground)) + 1) * 1e6;

    return {
      Rs_meters: Rs,
      gr_shift_us_day,
      sr_shift_us_day,
      net_shift_us_day,
      pos_drift_km_day,
      z_grav,
      shapiro_delay_us,
      dtau_dt_ground,
      dtau_dt_clock_grav
    };
  }, [sourceMassKg, sourceRadiusM, clockAltitudeKm, clockSpeedKmS]);

  /* -------------------------------------------------------------------------- */
  /* FERRAMENTA 4: SIMULADOR DE LENTEAMENTO GRAVITACIONAL & ANEL DE EINSTEIN   */
  /* -------------------------------------------------------------------------- */
  const [lensMassSolar, setLensMassSolar] = useState<number>(1.5e12); // Galáxia elíptica massiva
  const [distLensMpc, setDistLensMpc] = useState<number>(1000); // 1 Gpc
  const [distSourceMpc, setDistSourceMpc] = useState<number>(2500); // 2.5 Gpc
  const [sourceOffsetXArcsec, setSourceOffsetXArcsec] = useState<number>(0.4);
  const [sourceOffsetYArcsec, setSourceOffsetYArcsec] = useState<number>(0.2);

  const lensPresets = [
    { label: 'Cruz de Einstein (Q2237+0305)', mass: 1.0e11, Dl: 150, Ds: 2800, betaX: 0.15, betaY: 0.1, desc: '4 imagens simétricas de um quasar distante em torno de núcleo galáctico' },
    { label: 'Ferradura Cósmica (SDSS J1148+1930)', mass: 1.5e12, Dl: 1300, Ds: 3200, betaX: 0.05, betaY: 0.05, desc: 'Anel de Einstein quase perfeito com raio de ~5 segundos de arco' },
    { label: 'Aglomerado Abell 1689 (Lente Macro)', mass: 1.5e15, Dl: 700, Ds: 2200, betaX: 2.0, betaY: 1.5, desc: 'Aglomerado massivo gerando arcos gravitacionais gigantescos' },
    { label: 'Microlenteamento Estelar na Via Láctea', mass: 1.0, Dl: 0.004, Ds: 0.008, betaX: 0.0003, betaY: 0.0001, desc: 'Detecção de exoplanetas e corpos escuros por amplificação transitória' },
    { label: 'Alinhamento Perfeito (Anel Completo)', mass: 1.5e12, Dl: 1000, Ds: 2500, betaX: 0.0, betaY: 0.0, desc: 'Alinhamento colinear exato gerando anel luminoso contínuo' }
  ];

  const lensData = useMemo(() => {
    const M_kg = lensMassSolar * M_SUN;
    const Dl_m = distLensMpc * MPC_IN_METERS;
    const Ds_m = Math.max(Dl_m * 1.01, distSourceMpc * MPC_IN_METERS);
    const Dls_m = Ds_m - Dl_m;

    // Raio de Einstein em radianos: theta_E = sqrt(4 * G * M * Dls / (c^2 * Dl * Ds))
    const theta_E_rad = Math.sqrt((4 * G * M_kg * Dls_m) / (c * c * Dl_m * Ds_m));
    const theta_E_arcsec = theta_E_rad / ARCSEC_TO_RAD;

    // Posição angular da fonte não perturbada beta = sqrt(bx^2 + by^2)
    const beta_arcsec = Math.sqrt(sourceOffsetXArcsec * sourceOffsetXArcsec + sourceOffsetYArcsec * sourceOffsetYArcsec);
    const u = Math.max(0.0001, beta_arcsec / Math.max(1e-6, theta_E_arcsec));

    // Posições das duas imagens principais theta_+ e theta_-
    const theta_plus_arcsec = 0.5 * (beta_arcsec + Math.sqrt(beta_arcsec * beta_arcsec + 4 * theta_E_arcsec * theta_E_arcsec));
    const theta_minus_arcsec = 0.5 * (beta_arcsec - Math.sqrt(beta_arcsec * beta_arcsec + 4 * theta_E_arcsec * theta_E_arcsec));

    // Magnificação individual
    const mu_plus = (Math.pow(u, 2) + 2) / (2 * u * Math.sqrt(u * u + 4)) + 0.5;
    const mu_minus = (Math.pow(u, 2) + 2) / (2 * u * Math.sqrt(u * u + 4)) - 0.5;
    const mu_tot = (Math.pow(u, 2) + 2) / (u * Math.sqrt(u * u + 4));

    // Ângulo de posição no plano do céu
    const angle = Math.atan2(sourceOffsetYArcsec, sourceOffsetXArcsec);

    return {
      theta_E_arcsec,
      beta_arcsec,
      theta_plus_arcsec,
      theta_minus_arcsec,
      mu_plus,
      mu_minus,
      mu_tot,
      angle
    };
  }, [lensMassSolar, distLensMpc, distSourceMpc, sourceOffsetXArcsec, sourceOffsetYArcsec]);

  /* -------------------------------------------------------------------------- */
  /* FERRAMENTA 5: CALCULADOR DE ONDAS GRAVITACIONAIS & MASSA DE CHIRP (LIGO)   */
  /* -------------------------------------------------------------------------- */
  const [mass1Solar, setMass1Solar] = useState<number>(35.6); // GW150914 Primário
  const [mass2Solar, setMass2Solar] = useState<number>(30.6); // GW150914 Secundário
  const [gwDistMpc, setGwDistMpc] = useState<number>(410); // 410 Mpc
  const [currGwFreqHz, setCurrGwFreqHz] = useState<number>(100); // 100 Hz durante o inspiral

  const gwPresets = [
    { label: 'GW150914 (1ª Detecção Histórica)', m1: 35.6, m2: 30.6, d: 410, f: 100, desc: 'Primeira observação direta de ondas gravitacionais pelo LIGO em 2015' },
    { label: 'GW170817 (Fusão de Estrelas de Nêutrons)', m1: 1.46, m2: 1.27, d: 40, f: 300, desc: 'Evento multimensageiro com contrapartida óptica kilonova e GRB' },
    { label: 'GW190521 (Buracos Negros Hipermaciços)', m1: 85.0, m2: 66.0, d: 5300, f: 45, desc: 'Fusão no gap de massa de instabilidade de pares gerando buraco negro intermediário' },
    { label: 'GW200115 (Misto Buraco Negro + Estrela Nêutrons)', m1: 5.7, m2: 1.5, d: 300, f: 120, desc: 'Engolfamento de estrela de nêutrons por buraco negro estelar' },
    { label: 'Binária Supermassiva LISA (mHz)', m1: 1.0e6, m2: 5.0e5, d: 10000, f: 0.002, desc: 'Alvo primordial do futuro observatório espacial LISA na faixa milihertz' }
  ];

  const gwData = useMemo(() => {
    const m1_kg = mass1Solar * M_SUN;
    const m2_kg = mass2Solar * M_SUN;
    const M_tot_kg = m1_kg + m2_kg;
    const M_tot_solar = mass1Solar + mass2Solar;
    const d_m = gwDistMpc * MPC_IN_METERS;

    // Massa de Chirp Mc = (m1*m2)^(3/5) / (m1+m2)^(1/5)
    const Mc_kg = Math.pow(m1_kg * m2_kg, 3 / 5) / Math.pow(M_tot_kg, 1 / 5);
    const Mc_solar = Mc_kg / M_SUN;

    // Parâmetro de massa simétrica eta = m1*m2 / (m1+m2)^2
    const eta = (m1_kg * m2_kg) / Math.pow(M_tot_kg, 2);

    // Frequência orbital de corte (ISCO) f_isco = c^3 / (6^(3/2) * pi * G * M_tot)
    const f_isco_orbital = Math.pow(c, 3) / (Math.pow(6, 1.5) * Math.PI * G * M_tot_kg);
    const f_merger_gw = 2 * f_isco_orbital; // Onda gravitacional quadrupolar emite a 2*f_orb

    // Frequência de ringdown aproximada do buraco negro final
    const f_ringdown_gw = (Math.pow(c, 3) / (2 * Math.PI * G * (0.95 * M_tot_kg))) * 0.8;

    // Frequência atual limitada pelo merger
    const f_actual = Math.min(currGwFreqHz, f_merger_gw);

    // Chirp Rate df/dt = (96/5) * pi^(8/3) * (G*Mc / c^3)^(5/3) * f^(11/3)
    const chirp_rate = (96 / 5) * Math.pow(Math.PI, 8 / 3) * Math.pow((G * Mc_kg) / Math.pow(c, 3), 5 / 3) * Math.pow(f_actual, 11 / 3);

    // Tempo restante até a coalescência (tau) a partir de f_actual
    const time_to_merger_sec = (5 / 256) * Math.pow(c, 5) * Math.pow(G * Mc_kg, -5 / 3) * Math.pow(Math.PI * f_actual, -8 / 3);

    // Amplitude de deformação do espaço-tempo (strain h)
    const strain_h = (4 / d_m) * Math.pow((G * Mc_kg) / (c * c), 5 / 3) * Math.pow((Math.PI * f_actual) / c, 2 / 3);

    // Luminosidade gravitacional de pico L_peak ~ c^5 / G ~ 3.6e52 W
    const L_peak_watts = (Math.pow(c, 5) / G) * eta * 0.1;

    // Energia total irradiada (aprox 3 a 5% da massa de repouso)
    const E_radiated_solar = M_tot_solar * (1 - Math.sqrt(1 - 4 * eta * (1 - Math.sqrt(1 - 0.7 * 0.7))));

    // Forma de onda sintética para o plot do Chirp (strain x tempo)
    const waveformPoints: { t: number; h: number }[] = [];
    const nPts = 200;
    for (let i = 0; i < nPts; i++) {
      const frac = i / nPts;
      const t_rel = (frac - 0.85); // merger em 0.85
      let amp = 0;
      let phase = 0;
      if (t_rel < 0) {
        // Inspiral
        const norm = Math.max(0.01, 1 - Math.abs(t_rel) / 0.85);
        amp = Math.pow(norm, 0.4);
        const freq_t = 10 + 90 * Math.pow(norm, 1.5);
        phase = freq_t * t_rel * 2 * Math.PI;
      } else {
        // Ringdown
        const tau_rd = 0.05;
        amp = Math.exp(-t_rel / tau_rd);
        phase = 180 * t_rel * 2 * Math.PI;
      }
      waveformPoints.push({ t: frac, h: amp * Math.sin(phase) });
    }

    return {
      Mc_solar,
      M_tot_solar,
      f_merger_gw,
      f_ringdown_gw,
      chirp_rate,
      time_to_merger_sec,
      strain_h,
      L_peak_watts,
      E_radiated_solar,
      waveformPoints
    };
  }, [mass1Solar, mass2Solar, gwDistMpc, currGwFreqHz]);

  return (
    <div className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 sm:p-6 text-slate-100 shadow-2xl">
      {/* CABEÇALHO DA SUÍTE */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-gradient-to-br from-cyan-500/20 via-purple-500/20 to-amber-500/20 border border-cyan-500/30 text-cyan-400">
            <Orbit className="w-6 h-6 animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white tracking-wide">
                Astrodinâmica Relativística, Geodésicas & Ondas Gravitacionais
              </h2>
              <span className="px-2 py-0.5 text-xs font-semibold bg-cyan-950/80 text-cyan-300 border border-cyan-800/60 rounded-full">
                Relatividade Geral & LIGO
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Geometria de Schwarzschild & Kerr, precessão do periélio, dilatação temporal GPS, anéis de Einstein e coalescência de binárias compactas
            </p>
          </div>
        </div>

        {/* NAVEGAÇÃO ENTRE AS 5 FERRAMENTAS */}
        <div className="flex flex-wrap gap-1.5 bg-slate-900/90 p-1.5 rounded-lg border border-slate-800">
          <button
            onClick={() => setActiveTab('black-hole-geometry')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeTab === 'black-hole-geometry'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-900/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Circle className="w-3.5 h-3.5" />
            Buracos Negros (Rs/Kerr)
          </button>

          <button
            onClick={() => setActiveTab('geodesic-precession')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeTab === 'geodesic-precession'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-900/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            Precessão do Periélio
          </button>

          <button
            onClick={() => setActiveTab('time-dilation-redshift')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeTab === 'time-dilation-redshift'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-900/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Dilatação Temporal & GPS
          </button>

          <button
            onClick={() => setActiveTab('gravitational-lensing')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeTab === 'gravitational-lensing'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-900/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            Lenteamento & Anel de Einstein
          </button>

          <button
            onClick={() => setActiveTab('gravitational-waves')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeTab === 'gravitational-waves'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-900/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Waves className="w-3.5 h-3.5" />
            Ondas Gravitacionais (LIGO)
          </button>
        </div>
      </div>

      {/* CONTEÚDO DAS FERRAMENTAS */}
      <div className="mt-6">
        {/* ========================================================================= */}
        {/* ABA 1: GEOMETRIA DE BURACOS NEGROS (SCHWARZSCHILD / KERR)                 */}
        {/* ========================================================================= */}
        {activeTab === 'black-hole-geometry' && (
          <div className="space-y-6">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Controles e Presets */}
              <div className="w-full lg:w-5/12 space-y-4">
                <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                  <h3 className="text-sm font-semibold text-cyan-400 mb-3 flex items-center gap-2">
                    <Sliders className="w-4 h-4" /> Parâmetros de Entrada
                  </h3>

                  <div className="space-y-4 text-xs">
                    <div>
                      <div className="flex justify-between text-slate-300 mb-1">
                        <span>Massa do Buraco Negro (M / M☉):</span>
                        <span className="font-mono text-cyan-300">{bhMassSolar.toExponential(3)} M☉</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="10"
                        step="0.01"
                        value={Math.log10(Math.max(1e-10, bhMassSolar))}
                        onChange={(e) => setBhMassSolar(Math.pow(10, parseFloat(e.target.value) || 0))}
                        className="w-full accent-cyan-500 cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-0.5">
                        <span>10⁻¹⁰ M☉</span>
                        <span>1 M☉</span>
                        <span>10⁶ M☉ (Sgr A*)</span>
                        <span>10¹⁰ M☉ (M87*)</span>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-slate-300 mb-1">
                        <span>Parâmetro de Spin Adimensional (a* = Jc/GM²):</span>
                        <span className="font-mono text-amber-300">{bhSpin.toFixed(3)}</span>
                      </div>
                      <input
                        type="range"
                        min="-0.999"
                        max="0.999"
                        step="0.001"
                        value={bhSpin}
                        onChange={(e) => setBhSpin(parseFloat(e.target.value) || 0)}
                        className="w-full accent-amber-500 cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-0.5">
                        <span>-0.999 (Retrógrado)</span>
                        <span>0.0 (Schwarzschild)</span>
                        <span>+0.999 (Extremo)</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Presets Rápidos */}
                <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                  <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Astrofísica Observacional: Presets Reais
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {bhPresets.map((preset, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setBhMassSolar(preset.mass);
                          setBhSpin(preset.spin);
                        }}
                        className="p-2 text-left rounded-lg bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800/60 hover:border-cyan-500/40 transition-all text-xs"
                      >
                        <div className="font-medium text-slate-200">{preset.label}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{preset.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Resultados e Gráficos */}
              <div className="w-full lg:w-7/12 space-y-4">
                {/* Visualizador 2D do Buraco Negro */}
                <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 flex flex-col items-center">
                  <div className="w-full flex justify-between items-center mb-2">
                    <span className="text-xs font-semibold text-cyan-400 flex items-center gap-1.5">
                      <Eye className="w-4 h-4" /> Corte Transversal de Horizontes & Órbitas Críticas
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Rs = {(bhGeometry.Rs / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} km
                    </span>
                  </div>

                  <div className="w-full max-w-[420px] aspect-square relative flex items-center justify-center bg-black/60 rounded-xl border border-slate-800 overflow-hidden">
                    {/* Fundo Estelar e Disco de Acreção */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.15)_0%,transparent_70%)]" />

                    <svg viewBox="-200 -200 400 400" className="w-full h-full">
                      {/* Disco de Acreção Fluido com Beaming Relativístico */}
                      <ellipse
                        cx="0"
                        cy="0"
                        rx="170"
                        ry="48"
                        fill="none"
                        stroke="url(#accretionGrad)"
                        strokeWidth="28"
                        opacity="0.8"
                        transform="rotate(-15)"
                      />

                      {/* Órbita ISCO */}
                      <circle
                        cx="0"
                        cy="0"
                        r={Math.min(180, Math.max(45, (bhGeometry.r_isco / bhGeometry.Rs) * 45))}
                        fill="none"
                        stroke="#06b6d4"
                        strokeWidth="1.5"
                        strokeDasharray="4 4"
                        opacity="0.7"
                      />

                      {/* Esfera de Fótons */}
                      <circle
                        cx="0"
                        cy="0"
                        r={Math.min(150, Math.max(35, (bhGeometry.r_ph_pro / bhGeometry.Rs) * 45))}
                        fill="none"
                        stroke="#f59e0b"
                        strokeWidth="1.5"
                        strokeDasharray="2 3"
                        opacity="0.9"
                      />

                      {/* Ergosfera Externa (se spin != 0) */}
                      {Math.abs(bhSpin) > 0.05 && (
                        <ellipse
                          cx="0"
                          cy="0"
                          rx="45"
                          ry="35"
                          fill="rgba(139, 92, 246, 0.15)"
                          stroke="#8b5cf6"
                          strokeWidth="1"
                          strokeDasharray="3 3"
                        />
                      )}

                      {/* Horizonte de Eventos Kerr/Schwarzschild r_+ */}
                      <circle
                        cx="0"
                        cy="0"
                        r={Math.max(15, (bhGeometry.r_plus / bhGeometry.Rs) * 45)}
                        fill="#020617"
                        stroke="#06b6d4"
                        strokeWidth="2.5"
                      />

                      {/* Gradiente para o Disco */}
                      <defs>
                        <linearGradient id="accretionGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.9" />
                          <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.7" />
                          <stop offset="100%" stopColor="#ef4444" stopOpacity="0.3" />
                        </linearGradient>
                      </defs>
                    </svg>

                    {/* Legenda em Overlay */}
                    <div className="absolute bottom-2 left-2 text-[10px] space-y-0.5 bg-slate-950/80 p-1.5 rounded border border-slate-800">
                      <div className="flex items-center gap-1.5 text-cyan-400">
                        <span className="w-2 h-0.5 bg-cyan-400 inline-block" /> Horizonte r₊: {(bhGeometry.r_plus / 1000).toFixed(0)} km
                      </div>
                      <div className="flex items-center gap-1.5 text-amber-400">
                        <span className="w-2 h-0.5 bg-amber-400 inline-block" /> Esfera de Fótons: {(bhGeometry.r_ph_pro / 1000).toFixed(0)} km
                      </div>
                      <div className="flex items-center gap-1.5 text-sky-400">
                        <span className="w-2 h-0.5 bg-sky-400 inline-block border-dashed" /> ISCO: {(bhGeometry.r_isco / 1000).toFixed(0)} km
                      </div>
                    </div>
                  </div>
                </div>

                {/* Métricas Numéricas Exatas */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                    <span className="text-[11px] text-slate-400">Raio Schwarzschild (Rs):</span>
                    <div className="text-sm font-bold text-cyan-300 font-mono mt-0.5">
                      {(bhGeometry.Rs / 1000).toExponential(3)} km
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">2GM / c²</span>
                  </div>

                  <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                    <span className="text-[11px] text-slate-400">Raio ISCO (Órbita Estável):</span>
                    <div className="text-sm font-bold text-amber-300 font-mono mt-0.5">
                      {(bhGeometry.r_isco / 1000).toExponential(3)} km
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">{(bhGeometry.r_isco / bhGeometry.Rs).toFixed(2)} Rs</span>
                  </div>

                  <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                    <span className="text-[11px] text-slate-400">Temp. Radiação Hawking:</span>
                    <div className="text-sm font-bold text-purple-300 font-mono mt-0.5">
                      {bhGeometry.T_hawking.toExponential(3)} K
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">ħ c³ / 8πGMkB</span>
                  </div>

                  <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                    <span className="text-[11px] text-slate-400">Área do Horizonte:</span>
                    <div className="text-sm font-bold text-emerald-300 font-mono mt-0.5">
                      {(bhGeometry.area / 1e6).toExponential(3)} km²
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">4π(r₊² + a²)</span>
                  </div>

                  <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                    <span className="text-[11px] text-slate-400">Entropia Bekenstein-Hawking:</span>
                    <div className="text-sm font-bold text-rose-300 font-mono mt-0.5">
                      {bhGeometry.entropy_adim.toExponential(3)} kB
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">A / 4ℓP²</span>
                  </div>

                  <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                    <span className="text-[11px] text-slate-400">Tempo de Evaporação:</span>
                    <div className="text-sm font-bold text-slate-200 font-mono mt-0.5">
                      {bhGeometry.t_evap_years > 1e100 ? '> 10¹⁰⁰ anos' : `${bhGeometry.t_evap_years.toExponential(2)} anos`}
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">5120πG²M³ / ħc⁴</span>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => copyToClipboard(`Raio Schwarzschild: ${(bhGeometry.Rs/1000).toExponential(3)} km\nISCO: ${(bhGeometry.r_isco/1000).toExponential(3)} km\nTemp Hawking: ${bhGeometry.T_hawking.toExponential(3)} K\nEntropia: ${bhGeometry.entropy_adim.toExponential(3)} kB`)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    Copiar Métricas de Schwarzschild/Kerr
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* ABA 2: SIMULADOR DE GEODÉSICAS & PRECESSÃO DO PERIÉLIO DE EINSTEIN        */}
        {/* ========================================================================= */}
        {activeTab === 'geodesic-precession' && (
          <div className="space-y-6">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Controles Orbitais */}
              <div className="w-full lg:w-5/12 space-y-4">
                <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                  <h3 className="text-sm font-semibold text-cyan-400 mb-3 flex items-center gap-2">
                    <Sliders className="w-4 h-4" /> Parâmetros Orbitais Relativísticos
                  </h3>

                  <div className="space-y-4 text-xs">
                    <div>
                      <div className="flex justify-between text-slate-300 mb-1">
                        <span>Massa Central (M / M☉):</span>
                        <span className="font-mono text-cyan-300">{centralMassSolar.toLocaleString()} M☉</span>
                      </div>
                      <input
                        type="range"
                        min="-1"
                        max="7"
                        step="0.05"
                        value={Math.log10(Math.max(0.1, centralMassSolar))}
                        onChange={(e) => setCentralMassSolar(Math.pow(10, parseFloat(e.target.value) || 0))}
                        className="w-full accent-cyan-500 cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-slate-300 mb-1">
                        <span>Semi-eixo Maior (a):</span>
                        <span className="font-mono text-amber-300">{semiMajorAxisAU < 0.01 ? semiMajorAxisAU.toExponential(3) : semiMajorAxisAU.toFixed(4)} AU</span>
                      </div>
                      <input
                        type="range"
                        min="-5"
                        max="3"
                        step="0.05"
                        value={Math.log10(Math.max(1e-5, semiMajorAxisAU))}
                        onChange={(e) => setSemiMajorAxisAU(Math.pow(10, parseFloat(e.target.value) || 0))}
                        className="w-full accent-amber-500 cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-slate-300 mb-1">
                        <span>Excentricidade Orbital (e):</span>
                        <span className="font-mono text-purple-300">{eccentricity.toFixed(4)}</span>
                      </div>
                      <input
                        type="range"
                        min="0.01"
                        max="0.95"
                        step="0.01"
                        value={eccentricity}
                        onChange={(e) => setEccentricity(parseFloat(e.target.value) || 0)}
                        className="w-full accent-purple-500 cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-slate-300 mb-1">
                        <span>Amplificador Visual de Precessão:</span>
                        <span className="font-mono text-emerald-300">{relCouplingMult}x</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="1000"
                        step="1"
                        value={relCouplingMult}
                        onChange={(e) => setRelCouplingMult(parseInt(e.target.value) || 0)}
                        className="w-full accent-emerald-500 cursor-pointer"
                      />
                      <span className="text-[10px] text-slate-500">
                        Multiplica o avanço angular gráfico para tornar a roseta visível sem alterar a física analítica.
                      </span>
                    </div>
                  </div>
                </div>

                {/* Presets */}
                <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                  <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Casos de Estudo Canônicos
                  </h4>
                  <div className="space-y-1.5">
                    {orbitPresets.map((preset, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setCentralMassSolar(preset.mass);
                          setSemiMajorAxisAU(preset.a);
                          setEccentricity(preset.e);
                          setRelCouplingMult(preset.mult);
                        }}
                        className="w-full p-2 text-left rounded-lg bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800/60 hover:border-cyan-500/40 transition-all text-xs"
                      >
                        <div className="font-medium text-slate-200">{preset.label}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{preset.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Trajetória de Roseta Relativística */}
              <div className="w-full lg:w-7/12 space-y-4">
                <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 flex flex-col items-center">
                  <div className="w-full flex justify-between items-center mb-2">
                    <span className="text-xs font-semibold text-cyan-400 flex items-center gap-1.5">
                      <Orbit className="w-4 h-4" /> Trajetória Geodésica no Espaço-Tempo (Roseta de Einstein)
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Período P = {precessionData.P_years < 1 ? (precessionData.P_years * 365.25).toFixed(1) + ' dias' : precessionData.P_years.toFixed(2) + ' anos'}
                    </span>
                  </div>

                  <div className="w-full max-w-[420px] aspect-square relative flex items-center justify-center bg-black/60 rounded-xl border border-slate-800 overflow-hidden">
                    <svg viewBox="-2.5 -2.5 5 5" className="w-full h-full">
                      {/* Grid de Coordenadas Polares */}
                      <circle cx="0" cy="0" r="1" fill="none" stroke="#1e293b" strokeWidth="0.02" />
                      <circle cx="0" cy="0" r="2" fill="none" stroke="#1e293b" strokeWidth="0.02" />
                      <line x1="-2.4" y1="0" x2="2.4" y2="0" stroke="#1e293b" strokeWidth="0.015" />
                      <line x1="0" y1="-2.4" x2="0" y2="2.4" stroke="#1e293b" strokeWidth="0.015" />

                      {/* Trajetória de Precessão */}
                      <polyline
                        points={precessionData.points.map(p => `${p.x.toFixed(4)},${p.y.toFixed(4)}`).join(' ')}
                        fill="none"
                        stroke="url(#orbitGradient)"
                        strokeWidth="0.03"
                        strokeLinecap="round"
                      />

                      {/* Corpo Central */}
                      <circle cx="0" cy="0" r="0.12" fill="#f59e0b" stroke="#fbbf24" strokeWidth="0.02" />

                      {/* Gradiente da Órbita */}
                      <defs>
                        <linearGradient id="orbitGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#06b6d4" />
                          <stop offset="50%" stopColor="#8b5cf6" />
                          <stop offset="100%" stopColor="#ec4899" />
                        </linearGradient>
                      </defs>
                    </svg>

                    <div className="absolute top-2 right-2 text-[10px] bg-slate-950/80 px-2 py-1 rounded border border-slate-800 text-slate-300 font-mono">
                      Δφ = {precessionData.delta_phi_arcsec_per_orbit < 0.01 ? precessionData.delta_phi_arcsec_per_orbit.toExponential(3) : precessionData.delta_phi_arcsec_per_orbit.toFixed(4)}&quot; / rev
                    </div>
                  </div>
                </div>

                {/* Métricas da Precessão */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                    <span className="text-[11px] text-slate-400">Avanço Secular do Periélio:</span>
                    <div className="text-sm font-bold text-cyan-300 font-mono mt-0.5">
                      {precessionData.precession_arcsec_century < 1e5 ? precessionData.precession_arcsec_century.toFixed(2) : precessionData.precession_arcsec_century.toExponential(2)}&quot; / séc
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">6πGM / a(1-e²)c²</span>
                  </div>

                  <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                    <span className="text-[11px] text-slate-400">Deflexão de Luz no Periélio:</span>
                    <div className="text-sm font-bold text-amber-300 font-mono mt-0.5">
                      {precessionData.light_deflection_arcsec.toFixed(3)}&quot;
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">4GM / r c²</span>
                  </div>

                  <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                    <span className="text-[11px] text-slate-400">Distância do Periélio:</span>
                    <div className="text-sm font-bold text-purple-300 font-mono mt-0.5">
                      {precessionData.r_peri_km.toExponential(3)} km
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">a(1 - e)</span>
                  </div>
                </div>

                <div className="p-3 bg-cyan-950/30 border border-cyan-800/40 rounded-lg text-xs text-slate-300">
                  <div className="flex items-center gap-1.5 font-semibold text-cyan-400 mb-1">
                    <Info className="w-4 h-4" /> O Triunfo Histórico de Einstein (1915)
                  </div>
                  A mecânica newtoniana falhava em explicar um resíduo anômalo de <span className="text-cyan-300 font-mono">43&quot;/século</span> na órbita de Mercúrio. A equação de geodésica relativística de Einstein previu exatamente <span className="text-emerald-400 font-mono">42.98&quot;</span> sem parâmetros livres, validando a curvatura do espaço-tempo.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* ABA 3: DILATAÇÃO TEMPORAL GRAVITACIONAL & RELÓGIOS GPS                    */}
        {/* ========================================================================= */}
        {activeTab === 'time-dilation-redshift' && (
          <div className="space-y-6">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Controles de Massa e Altitude */}
              <div className="w-full lg:w-5/12 space-y-4">
                <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                  <h3 className="text-sm font-semibold text-cyan-400 mb-3 flex items-center gap-2">
                    <Sliders className="w-4 h-4" /> Parâmetros do Relógio & Campo Gravitacional
                  </h3>

                  <div className="space-y-4 text-xs">
                    <div>
                      <div className="flex justify-between text-slate-300 mb-1">
                        <span>Massa da Fonte Central (kg):</span>
                        <span className="font-mono text-cyan-300">{sourceMassKg.toExponential(3)} kg</span>
                      </div>
                      <input
                        type="range"
                        min="23"
                        max="31"
                        step="0.1"
                        value={Math.log10(sourceMassKg)}
                        onChange={(e) => setSourceMassKg(Math.pow(10, parseFloat(e.target.value) || 0))}
                        className="w-full accent-cyan-500 cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-slate-300 mb-1">
                        <span>Raio da Superfície Base (km):</span>
                        <span className="font-mono text-amber-300">{(sourceRadiusM / 1000).toLocaleString()} km</span>
                      </div>
                      <input
                        type="range"
                        min="3"
                        max="9"
                        step="0.05"
                        value={Math.log10(sourceRadiusM)}
                        onChange={(e) => setSourceRadiusM(Math.pow(10, parseFloat(e.target.value) || 0))}
                        className="w-full accent-amber-500 cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-slate-300 mb-1">
                        <span>Altitude do Relógio Orbital (km):</span>
                        <span className="font-mono text-purple-300">{clockAltitudeKm.toLocaleString()} km</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="50000"
                        step="100"
                        value={clockAltitudeKm}
                        onChange={(e) => setClockAltitudeKm(parseFloat(e.target.value) || 0)}
                        className="w-full accent-purple-500 cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-slate-300 mb-1">
                        <span>Velocidade Orbital do Relógio (km/s):</span>
                        <span className="font-mono text-emerald-300">{clockSpeedKmS.toFixed(3)} km/s</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="30"
                        step="0.1"
                        value={clockSpeedKmS}
                        onChange={(e) => setClockSpeedKmS(parseFloat(e.target.value) || 0)}
                        className="w-full accent-emerald-500 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                {/* Presets */}
                <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                  <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Cenários Operacionais & Astrofísicos
                  </h4>
                  <div className="space-y-1.5">
                    {timePresets.map((preset, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setSourceMassKg(preset.mass);
                          setSourceRadiusM(preset.r);
                          setClockAltitudeKm(preset.alt);
                          setClockSpeedKmS(preset.v);
                        }}
                        className="w-full p-2 text-left rounded-lg bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800/60 hover:border-cyan-500/40 transition-all text-xs"
                      >
                        <div className="font-medium text-slate-200">{preset.label}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{preset.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Balanço GPS Relatividade Geral vs Especial */}
              <div className="w-full lg:w-7/12 space-y-4">
                <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                  <h3 className="text-sm font-semibold text-cyan-400 mb-3 flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Clock className="w-4 h-4" /> Balanço Relativístico Diário dos Relógios Atômicos
                    </span>
                    <span className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${timeDilationData.net_shift_us_day >= 0 ? 'bg-cyan-950 text-cyan-300 border border-cyan-800' : 'bg-rose-950 text-rose-300 border border-rose-800'}`}>
                      {timeDilationData.net_shift_us_day >= 0 ? '+' : ''}{timeDilationData.net_shift_us_day.toFixed(2)} µs/dia
                    </span>
                  </h3>

                  {/* Gráfico de Barras Relatividade Geral vs Especial */}
                  <div className="space-y-3 my-4">
                    <div>
                      <div className="flex justify-between text-xs text-slate-300 mb-1">
                        <span className="flex items-center gap-1.5 text-cyan-400 font-medium">
                          <Orbit className="w-3.5 h-3.5" /> Relatividade Geral (RG - Potencial Gravitacional mais alto):
                        </span>
                        <span className="font-mono text-cyan-300 font-bold">+{timeDilationData.gr_shift_us_day.toFixed(2)} µs/dia (Acelera)</span>
                      </div>
                      <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800">
                        <div
                          className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 rounded-full transition-all"
                          style={{ width: `${Math.min(100, Math.max(5, (timeDilationData.gr_shift_us_day / 60) * 100))}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs text-slate-300 mb-1">
                        <span className="flex items-center gap-1.5 text-rose-400 font-medium">
                          <Zap className="w-3.5 h-3.5" /> Relatividade Especial (RE - Cinemática de Lorentz v = {clockSpeedKmS} km/s):
                        </span>
                        <span className="font-mono text-rose-300 font-bold">{timeDilationData.sr_shift_us_day.toFixed(2)} µs/dia (Atrasa)</span>
                      </div>
                      <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800">
                        <div
                          className="h-full bg-gradient-to-r from-rose-600 to-rose-400 rounded-full transition-all"
                          style={{ width: `${Math.min(100, Math.max(5, (Math.abs(timeDilationData.sr_shift_us_day) / 60) * 100))}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Alerta Crítico GPS */}
                  <div className="p-3 bg-amber-950/30 border border-amber-800/40 rounded-lg text-xs text-slate-300 space-y-1">
                    <div className="flex items-center gap-1.5 font-semibold text-amber-400">
                      <Radio className="w-4 h-4" /> Deriva de Posição sem Calibração Relativística
                    </div>
                    <p>
                      Se os osciladores de césio dos satélites não fossem sintonizados de fábrica de <span className="text-amber-300 font-mono">10.23 MHz</span> para <span className="text-emerald-300 font-mono">10.22999999543 MHz</span>, a descompensação temporal de <span className="text-white font-mono font-bold">~38.6 µs/dia</span> acumularia um erro de localização terrestre de:
                    </p>
                    <div className="text-base font-bold text-amber-300 font-mono pt-1">
                      Δr ≈ {timeDilationData.pos_drift_km_day.toFixed(2)} km a cada 24 horas!
                    </div>
                  </div>
                </div>

                {/* Métricas Adicionais */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                    <span className="text-[11px] text-slate-400">Redshift Gravitacional (z):</span>
                    <div className="text-sm font-bold text-cyan-300 font-mono mt-0.5">
                      {timeDilationData.z_grav.toExponential(4)}
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">Δf / f no infinito</span>
                  </div>

                  <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                    <span className="text-[11px] text-slate-400">Atraso Temporal de Shapiro:</span>
                    <div className="text-sm font-bold text-purple-300 font-mono mt-0.5">
                      {timeDilationData.shapiro_delay_us.toFixed(2)} µs
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">Time Delay Gravitacional</span>
                  </div>

                  <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                    <span className="text-[11px] text-slate-400">Raio de Schwarzschild:</span>
                    <div className="text-sm font-bold text-emerald-300 font-mono mt-0.5">
                      {timeDilationData.Rs_meters < 1 ? (timeDilationData.Rs_meters * 1000).toFixed(2) + ' mm' : (timeDilationData.Rs_meters / 1000).toFixed(2) + ' km'}
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">2GM / c²</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* ABA 4: SIMULADOR DE LENTEAMENTO GRAVITACIONAL & ANEL DE EINSTEIN          */}
        {/* ========================================================================= */}
        {activeTab === 'gravitational-lensing' && (
          <div className="space-y-6">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Controles da Lente Gravitacional */}
              <div className="w-full lg:w-5/12 space-y-4">
                <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                  <h3 className="text-sm font-semibold text-cyan-400 mb-3 flex items-center gap-2">
                    <Sliders className="w-4 h-4" /> Geometria da Lente & Fonte
                  </h3>

                  <div className="space-y-4 text-xs">
                    <div>
                      <div className="flex justify-between text-slate-300 mb-1">
                        <span>Massa da Galáxia/Lente (M / M☉):</span>
                        <span className="font-mono text-cyan-300">{lensMassSolar.toExponential(2)} M☉</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="16"
                        step="0.1"
                        value={Math.log10(lensMassSolar)}
                        onChange={(e) => setLensMassSolar(Math.pow(10, parseFloat(e.target.value) || 0))}
                        className="w-full accent-cyan-500 cursor-pointer"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="flex justify-between text-slate-300 mb-1">
                          <span>Distância Lente (Dl):</span>
                          <span className="font-mono text-amber-300">{distLensMpc} Mpc</span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="4000"
                          step="10"
                          value={distLensMpc}
                          onChange={(e) => setDistLensMpc(parseInt(e.target.value) || 0)}
                          className="w-full accent-amber-500 cursor-pointer"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between text-slate-300 mb-1">
                          <span>Distância Fonte (Ds):</span>
                          <span className="font-mono text-amber-300">{distSourceMpc} Mpc</span>
                        </div>
                        <input
                          type="range"
                          min="10"
                          max="8000"
                          step="50"
                          value={distSourceMpc}
                          onChange={(e) => setDistSourceMpc(parseInt(e.target.value) || 0)}
                          className="w-full accent-amber-500 cursor-pointer"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-slate-300 mb-1">
                        <span>Deslocamento Angular da Fonte βx:</span>
                        <span className="font-mono text-purple-300">{sourceOffsetXArcsec.toFixed(3)}&quot;</span>
                      </div>
                      <input
                        type="range"
                        min="-3"
                        max="3"
                        step="0.02"
                        value={sourceOffsetXArcsec}
                        onChange={(e) => setSourceOffsetXArcsec(parseFloat(e.target.value) || 0)}
                        className="w-full accent-purple-500 cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-slate-300 mb-1">
                        <span>Deslocamento Angular da Fonte βy:</span>
                        <span className="font-mono text-purple-300">{sourceOffsetYArcsec.toFixed(3)}&quot;</span>
                      </div>
                      <input
                        type="range"
                        min="-3"
                        max="3"
                        step="0.02"
                        value={sourceOffsetYArcsec}
                        onChange={(e) => setSourceOffsetYArcsec(parseFloat(e.target.value) || 0)}
                        className="w-full accent-purple-500 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                {/* Presets */}
                <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                  <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Lentes Gravitacionais Famosas
                  </h4>
                  <div className="space-y-1.5">
                    {lensPresets.map((preset, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setLensMassSolar(preset.mass);
                          setDistLensMpc(preset.Dl);
                          setDistSourceMpc(preset.Ds);
                          setSourceOffsetXArcsec(preset.betaX);
                          setSourceOffsetYArcsec(preset.betaY);
                        }}
                        className="w-full p-2 text-left rounded-lg bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800/60 hover:border-cyan-500/40 transition-all text-xs"
                      >
                        <div className="font-medium text-slate-200">{preset.label}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{preset.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Simulador Óptico Gravitacional */}
              <div className="w-full lg:w-7/12 space-y-4">
                <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 flex flex-col items-center">
                  <div className="w-full flex justify-between items-center mb-2">
                    <span className="text-xs font-semibold text-cyan-400 flex items-center gap-1.5">
                      <Eye className="w-4 h-4" /> Visão Telescópica Sintética (HST / JWST)
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Raio de Einstein θE = {lensData.theta_E_arcsec.toFixed(3)}&quot;
                    </span>
                  </div>

                  <div className="w-full max-w-[420px] aspect-square relative flex items-center justify-center bg-black/80 rounded-xl border border-slate-800 overflow-hidden">
                    <svg viewBox="-4 -4 8 8" className="w-full h-full">
                      {/* Grade de Mira Astrométrica */}
                      <circle cx="0" cy="0" r="1" fill="none" stroke="#1e293b" strokeWidth="0.04" />
                      <circle cx="0" cy="0" r="2" fill="none" stroke="#1e293b" strokeWidth="0.04" />
                      <circle cx="0" cy="0" r="3" fill="none" stroke="#1e293b" strokeWidth="0.04" />

                      {/* Anel de Einstein Teórico (Tracejado) */}
                      <circle
                        cx="0"
                        cy="0"
                        r={Math.min(3.8, lensData.theta_E_arcsec)}
                        fill="none"
                        stroke="#06b6d4"
                        strokeWidth="0.03"
                        strokeDasharray="0.1 0.1"
                        opacity="0.6"
                      />

                      {/* Galáxia Lente Central (Amarela/Laranja) */}
                      <ellipse cx="0" cy="0" rx="0.35" ry="0.25" fill="#f59e0b" opacity="0.9" />
                      <circle cx="0" cy="0" r="0.15" fill="#fff" opacity="0.95" />

                      {/* Posição da Fonte Não-Perturbada (Fantasma) */}
                      <circle
                        cx={sourceOffsetXArcsec}
                        cy={-sourceOffsetYArcsec}
                        r="0.1"
                        fill="none"
                        stroke="#8b5cf6"
                        strokeWidth="0.03"
                        strokeDasharray="0.05 0.05"
                      />

                      {/* Arco / Imagem Positiva (+) */}
                      {lensData.beta_arcsec < 0.05 ? (
                        /* Anel Perfeito */
                        <circle
                          cx="0"
                          cy="0"
                          r={lensData.theta_E_arcsec}
                          fill="none"
                          stroke="#38bdf8"
                          strokeWidth="0.22"
                          opacity="0.9"
                        />
                      ) : (
                        <>
                          {/* Imagem + (Mais brilhante e amplificada) */}
                          <ellipse
                            cx={lensData.theta_plus_arcsec * Math.cos(lensData.angle)}
                            cy={-lensData.theta_plus_arcsec * Math.sin(lensData.angle)}
                            rx={Math.max(0.1, 0.15 * Math.sqrt(lensData.mu_plus))}
                            ry="0.12"
                            fill="#38bdf8"
                            opacity="0.9"
                            transform={`rotate(${(-lensData.angle * 180) / Math.PI + 90}, ${lensData.theta_plus_arcsec * Math.cos(lensData.angle)}, ${-lensData.theta_plus_arcsec * Math.sin(lensData.angle)})`}
                          />

                          {/* Imagem - (Oposta e menos amplificada) */}
                          <ellipse
                            cx={-Math.abs(lensData.theta_minus_arcsec) * Math.cos(lensData.angle)}
                            cy={Math.abs(lensData.theta_minus_arcsec) * Math.sin(lensData.angle)}
                            rx={Math.max(0.08, 0.1 * Math.sqrt(Math.max(0.1, lensData.mu_minus)))}
                            ry="0.09"
                            fill="#0284c7"
                            opacity="0.75"
                            transform={`rotate(${(-lensData.angle * 180) / Math.PI + 90}, ${-Math.abs(lensData.theta_minus_arcsec) * Math.cos(lensData.angle)}, ${Math.abs(lensData.theta_minus_arcsec) * Math.sin(lensData.angle)})`}
                          />
                        </>
                      )}
                    </svg>

                    <div className="absolute bottom-2 left-2 text-[10px] space-y-0.5 bg-slate-950/80 p-1.5 rounded border border-slate-800 font-mono">
                      <div className="text-amber-400">● Galáxia Lente Central</div>
                      <div className="text-cyan-400">● Arcos Distorcidos (Lenteados)</div>
                      <div className="text-purple-400">◌ Posição Real da Fonte (β)</div>
                    </div>
                  </div>
                </div>

                {/* Métricas do Lenteamento */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                    <span className="text-[11px] text-slate-400">Raio de Einstein (θE):</span>
                    <div className="text-sm font-bold text-cyan-300 font-mono mt-0.5">
                      {lensData.theta_E_arcsec.toFixed(3)}&quot;
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">sqrt(4GM Dls / c² Dl Ds)</span>
                  </div>

                  <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                    <span className="text-[11px] text-slate-400">Magnificação Total (µ):</span>
                    <div className="text-sm font-bold text-emerald-300 font-mono mt-0.5">
                      {lensData.mu_tot.toFixed(2)}x
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">µ+ + µ- (Amplificação)</span>
                  </div>

                  <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                    <span className="text-[11px] text-slate-400">Separação de Imagens:</span>
                    <div className="text-sm font-bold text-purple-300 font-mono mt-0.5">
                      {(lensData.theta_plus_arcsec - lensData.theta_minus_arcsec).toFixed(3)}&quot;
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">θ+ - θ-</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* ABA 5: ONDAS GRAVITACIONAIS & MASSA DE CHIRP (LIGO / VIRGO)               */}
        {/* ========================================================================= */}
        {activeTab === 'gravitational-waves' && (
          <div className="space-y-6">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Controles de Binárias Compactas */}
              <div className="w-full lg:w-5/12 space-y-4">
                <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                  <h3 className="text-sm font-semibold text-cyan-400 mb-3 flex items-center gap-2">
                    <Sliders className="w-4 h-4" /> Parâmetros do Par Binário
                  </h3>

                  <div className="space-y-4 text-xs">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="flex justify-between text-slate-300 mb-1">
                          <span>Massa Primária m₁:</span>
                          <span className="font-mono text-cyan-300">{mass1Solar} M☉</span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="150"
                          step="0.5"
                          value={mass1Solar}
                          onChange={(e) => setMass1Solar(parseFloat(e.target.value) || 0)}
                          className="w-full accent-cyan-500 cursor-pointer"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between text-slate-300 mb-1">
                          <span>Massa Secundária m₂:</span>
                          <span className="font-mono text-cyan-300">{mass2Solar} M☉</span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="150"
                          step="0.5"
                          value={mass2Solar}
                          onChange={(e) => setMass2Solar(parseFloat(e.target.value) || 0)}
                          className="w-full accent-cyan-500 cursor-pointer"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-slate-300 mb-1">
                        <span>Distância de Luminosidade (dL):</span>
                        <span className="font-mono text-amber-300">{gwDistMpc} Mpc</span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="6000"
                        step="10"
                        value={gwDistMpc}
                        onChange={(e) => setGwDistMpc(parseInt(e.target.value) || 0)}
                        className="w-full accent-amber-500 cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-slate-300 mb-1">
                        <span>Frequência Instantânea da Onda (fGW):</span>
                        <span className="font-mono text-purple-300">{currGwFreqHz} Hz</span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="1000"
                        step="5"
                        value={currGwFreqHz}
                        onChange={(e) => setCurrGwFreqHz(parseInt(e.target.value) || 0)}
                        className="w-full accent-purple-500 cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-0.5">
                        <span>10 Hz (Banda Baixa LIGO)</span>
                        <span>f_fusão = {gwData.f_merger_gw.toFixed(0)} Hz</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Presets de Eventos Reais LIGO/Virgo */}
                <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                  <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Eventos Históricos Registrados
                  </h4>
                  <div className="space-y-1.5">
                    {gwPresets.map((preset, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setMass1Solar(preset.m1);
                          setMass2Solar(preset.m2);
                          setGwDistMpc(preset.d);
                          setCurrGwFreqHz(preset.f);
                        }}
                        className="w-full p-2 text-left rounded-lg bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800/60 hover:border-cyan-500/40 transition-all text-xs"
                      >
                        <div className="font-medium text-slate-200">{preset.label}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{preset.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Forma de Onda do Chirp e Métricas */}
              <div className="w-full lg:w-7/12 space-y-4">
                <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-semibold text-cyan-400 flex items-center gap-1.5">
                      <Waves className="w-4 h-4" /> Sinal de Coalescência (Inspiral → Merger → Ringdown)
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Massa de Chirp ℳ = {gwData.Mc_solar.toFixed(2)} M☉
                    </span>
                  </div>

                  {/* Visualizador de Onda Gravitacional */}
                  <div className="w-full h-44 bg-black/70 rounded-xl border border-slate-800 relative flex items-center overflow-hidden px-2">
                    <svg viewBox="0 -1.5 200 3" className="w-full h-full" preserveAspectRatio="none">
                      {/* Eixo Central */}
                      <line x1="0" y1="0" x2="200" y2="0" stroke="#1e293b" strokeWidth="0.05" />

                      {/* Marcação da Fusão (Merger) */}
                      <line x1="170" y1="-1.5" x2="170" y2="1.5" stroke="#ef4444" strokeWidth="0.5" strokeDasharray="1 1" opacity="0.5" />

                      {/* Curva da Forma de Onda */}
                      <path
                        d={`M 0 0 ${gwData.waveformPoints.map(p => `L ${(p.t * 200).toFixed(1)} ${p.h.toFixed(3)}`).join(' ')}`}
                        fill="none"
                        stroke="#06b6d4"
                        strokeWidth="1.2"
                      />
                    </svg>

                    <div className="absolute top-2 left-3 text-[10px] font-mono text-cyan-300">
                      Inspiral Gravitacional (df/dt &gt; 0)
                    </div>
                    <div className="absolute top-2 right-12 text-[10px] font-mono text-rose-400">
                      Fusão &amp; Ringdown
                    </div>
                  </div>
                </div>

                {/* Métricas Astrofísicas */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                    <span className="text-[11px] text-slate-400">Massa de Chirp (ℳ):</span>
                    <div className="text-sm font-bold text-cyan-300 font-mono mt-0.5">
                      {gwData.Mc_solar.toFixed(2)} M☉
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">(m₁m₂)³/⁵ / (m₁+m₂)¹/⁵</span>
                  </div>

                  <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                    <span className="text-[11px] text-slate-400">Frequência de Pico (ISCO):</span>
                    <div className="text-sm font-bold text-amber-300 font-mono mt-0.5">
                      {gwData.f_merger_gw.toFixed(1)} Hz
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">Momento da Fusão</span>
                  </div>

                  <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                    <span className="text-[11px] text-slate-400">Strain de Deformação (h):</span>
                    <div className="text-sm font-bold text-purple-300 font-mono mt-0.5">
                      {gwData.strain_h.toExponential(2)}
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">ΔL / L no LIGO</span>
                  </div>

                  <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                    <span className="text-[11px] text-slate-400">Tempo até Coalescência:</span>
                    <div className="text-sm font-bold text-emerald-300 font-mono mt-0.5">
                      {gwData.time_to_merger_sec < 1 ? (gwData.time_to_merger_sec * 1000).toFixed(1) + ' ms' : gwData.time_to_merger_sec.toFixed(2) + ' s'}
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">Restante a {currGwFreqHz} Hz</span>
                  </div>

                  <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                    <span className="text-[11px] text-slate-400">Energia Irradiada:</span>
                    <div className="text-sm font-bold text-rose-300 font-mono mt-0.5">
                      ~{gwData.E_radiated_solar.toFixed(2)} M☉ c²
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">Convertida em Ondas</span>
                  </div>

                  <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                    <span className="text-[11px] text-slate-400">Luminosidade de Pico:</span>
                    <div className="text-sm font-bold text-slate-200 font-mono mt-0.5">
                      {gwData.L_peak_watts.toExponential(2)} W
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">&gt; Universo Estelar Visível</span>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => copyToClipboard(`Massa de Chirp: ${gwData.Mc_solar.toFixed(2)} M☉\nFrequência Fusão: ${gwData.f_merger_gw.toFixed(1)} Hz\nStrain h: ${gwData.strain_h.toExponential(2)}\nEnergia Irradiada: ~${gwData.E_radiated_solar.toFixed(2)} M☉ c²`)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    Copiar Métricas de Ondas Gravitacionais
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
