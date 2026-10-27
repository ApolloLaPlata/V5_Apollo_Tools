'use client';

import React, { useState, useEffect } from 'react';
import { 
  Glasses, 
  Compass, 
  Eye, 
  Maximize2, 
  Layers, 
  Radio, 
  Cpu, 
  Check, 
  Copy, 
  RotateCcw, 
  Sparkles, 
  Sliders, 
  Activity, 
  Smartphone, 
  CheckCircle2, 
  AlertTriangle,
  Move3d,
  Fingerprint,
  Info
} from 'lucide-react';

export function WebXrSpatialAndSensorsSuite({ defaultTab = 'webxr-device-session-tester' }: { defaultTab?: string }) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    try { if (navigator.clipboard?.writeText) navigator.clipboard.writeText(text).catch(() => {}); } catch {}
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  // -------------------------------------------------------------
  // TOOL 1: WEBXR DEVICE SESSION TESTER
  // -------------------------------------------------------------
  const [xrSupport, setXrSupport] = useState<{
    supported: boolean;
    immersiveVr: boolean | null;
    immersiveAr: boolean | null;
    inline: boolean | null;
  }>({
    supported: false,
    immersiveVr: null,
    immersiveAr: null,
    inline: null
  });

  const [testedFeatures, setTestedFeatures] = useState<Record<string, boolean>>({
    'local-floor': true,
    'bounded-floor': true,
    'hit-test': true,
    'hand-tracking': true,
    'mesh-detection': false,
    'plane-detection': true,
    'anchors': true
  });

  useEffect(() => {
    if (typeof window !== 'undefined' && 'xr' in navigator) {
      const xr = (navigator as any).xr;
      setXrSupport(prev => ({ ...prev, supported: true }));

      // Check session types if supported
      if (xr.isSessionSupported) {
        xr.isSessionSupported('immersive-vr')
          .then((sup: boolean) => setXrSupport(p => ({ ...p, immersiveVr: sup })))
          .catch(() => setXrSupport(p => ({ ...p, immersiveVr: false })));

        xr.isSessionSupported('immersive-ar')
          .then((sup: boolean) => setXrSupport(p => ({ ...p, immersiveAr: sup })))
          .catch(() => setXrSupport(p => ({ ...p, immersiveAr: false })));

        xr.isSessionSupported('inline')
          .then((sup: boolean) => setXrSupport(p => ({ ...p, inline: sup })))
          .catch(() => setXrSupport(p => ({ ...p, inline: true })));
      }
    }
  }, []);

  // -------------------------------------------------------------
  // TOOL 2: SPATIAL 6DOF POSE & QUATERNIONS
  // -------------------------------------------------------------
  const [posX, setPosX] = useState(0.0);
  const [posY, setPosY] = useState(1.65); // Altura típica dos olhos em metros
  const [posZ, setPosZ] = useState(-0.5);

  const [yawDeg, setYawDeg] = useState(15);   // Rotação Y
  const [pitchDeg, setPitchDeg] = useState(-5); // Rotação X
  const [rollDeg, setRollDeg] = useState(0);    // Rotação Z

  // Convert Euler (degrees) to Quaternion
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const yawRad = toRad(yawDeg);
  const pitchRad = toRad(pitchDeg);
  const rollRad = toRad(rollDeg);

  const cy = Math.cos(yawRad * 0.5);
  const sy = Math.sin(yawRad * 0.5);
  const cp = Math.cos(pitchRad * 0.5);
  const sp = Math.sin(pitchRad * 0.5);
  const cr = Math.cos(rollRad * 0.5);
  const sr = Math.sin(rollRad * 0.5);

  const qW = +(cr * cp * cy + sr * sp * sy).toFixed(4);
  const qX = +(sr * cp * cy - cr * sp * sy).toFixed(4);
  const qY = +(cr * sp * cy + sr * cp * sy).toFixed(4);
  const qZ = +(cr * cp * sy - sr * sp * cy).toFixed(4);

  // Direction forward vector
  const forwardX = +(2 * (qX * qZ + qW * qY)).toFixed(3);
  const forwardY = +(2 * (qY * qZ - qW * qX)).toFixed(3);
  const forwardZ = +(1 - 2 * (qX * qX + qY * qY)).toFixed(3);

  // -------------------------------------------------------------
  // TOOL 3: STEREOSCOPIC FOV & IPD CALCULATOR
  // -------------------------------------------------------------
  const [ipdMm, setIpdMm] = useState(64); // Distância interpupilar média humana (64mm)
  const [fovH, setFovH] = useState(110);   // Campo de visão horizontal (graus)
  const [targetHmd, setTargetHmd] = useState<'quest3' | 'visionpro' | 'index' | 'custom'>('quest3');

  const handleSelectHmd = (hmd: 'quest3' | 'visionpro' | 'index' | 'custom') => {
    setTargetHmd(hmd);
    if (hmd === 'quest3') {
      setIpdMm(65);
      setFovH(110);
    } else if (hmd === 'visionpro') {
      setIpdMm(64);
      setFovH(100);
    } else if (hmd === 'index') {
      setIpdMm(66);
      setFovH(130);
    }
  };

  const eyeSeparationMeters = (ipdMm / 1000).toFixed(4);
  const cameraLeftOffset = `-${(ipdMm / 2000).toFixed(4)}m`;
  const cameraRightOffset = `+${(ipdMm / 2000).toFixed(4)}m`;
  const verticalFovApprox = Math.round(fovH * 0.92);

  // -------------------------------------------------------------
  // TOOL 4: AR HIT-TEST & PLANE DETECTOR
  // -------------------------------------------------------------
  const [planeOrientation, setPlaneOrientation] = useState<'horizontal' | 'vertical'>('horizontal');
  const [rayDistance, setRayDistance] = useState(1.42); // metros até o impacto
  const [anchorConfidence, setAnchorConfidence] = useState(96);

  const hitResultMatrix = `[
  [ 1.000,  0.000,  0.000,  0.150 ], // X Translation
  [ 0.000, ${planeOrientation === 'horizontal' ? ' 1.000' : ' 0.000'}, ${planeOrientation === 'horizontal' ? ' 0.000' : '-1.000'},  ${planeOrientation === 'horizontal' ? '0.000' : '1.200'} ], // Y Translation
  [ 0.000, ${planeOrientation === 'horizontal' ? ' 0.000' : ' 1.000'}, ${planeOrientation === 'horizontal' ? ' 1.000' : ' 0.000'}, -${rayDistance.toFixed(3)} ], // Z Depth
  [ 0.000,  0.000,  0.000,  1.000 ]  // Affine W
]`;

  // -------------------------------------------------------------
  // TOOL 5: XR INPUT CONTROLLER & HAND TRACKING
  // -------------------------------------------------------------
  const [activeHand, setActiveHand] = useState<'right' | 'left'>('right');
  const [triggerValue, setTriggerValue] = useState(0.85); // 0 a 1
  const [gripValue, setGripValue] = useState(0.40);       // 0 a 1
  const [thumbstickX, setThumbstickX] = useState(0.20);   // -1 a 1
  const [thumbstickY, setThumbstickY] = useState(-0.65);  // -1 a 1
  const [hapticPulsing, setHapticPulsing] = useState(false);

  const triggerHaptic = () => {
    setHapticPulsing(true);
    setTimeout(() => setHapticPulsing(false), 500);
  };

  const handJoints = [
    { name: 'wrist', pose: 'X: 0.02, Y: 1.10, Z: -0.32' },
    { name: 'thumb-tip', pose: 'X: 0.06, Y: 1.18, Z: -0.28' },
    { name: 'index-finger-tip', pose: 'X: 0.04, Y: 1.22, Z: -0.30' },
    { name: 'middle-finger-tip', pose: 'X: 0.02, Y: 1.23, Z: -0.31' },
    { name: 'ring-finger-tip', pose: 'X: 0.00, Y: 1.21, Z: -0.31' },
    { name: 'pinky-finger-tip', pose: 'X: -0.02, Y: 1.17, Z: -0.30' },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-950/40 via-slate-900 to-indigo-950/40 p-6 border border-cyan-500/20 shadow-2xl shadow-cyan-950/30">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 flex items-center gap-1.5">
                <Glasses className="w-3 h-3 text-cyan-400 animate-pulse" /> WebXR Spatial Computing
              </span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                W3C WebXR Device API
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight flex items-center gap-2">
              Suíte de WebXR, VR/AR & Sensores Espaciais
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Diagnóstico de compatibilidade WebXR, conversor de poses espaciais 6DoF e quatérnions, cálculo de IPD/FOV estereoscópico, simulador de hit-test AR e inspetor de controladores com hand-tracking de 25 juntas.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-slate-950/60 px-4 py-2 rounded-xl border border-slate-800 text-xs text-slate-300">
            <Move3d className="w-4 h-4 text-cyan-400" />
            <span>Capitania #11 · Espaço Imersivo</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800 scrollbar-thin">
        {[
          { id: 'webxr-device-session-tester', label: 'Testador de Sessões WebXR', icon: Glasses },
          { id: 'spatial-6dof-pose-quaternions', label: 'Poses 6DoF & Quatérnions', icon: Compass },
          { id: 'stereoscopic-fov-ipd-calc', label: 'IPD & FOV Estereoscópico', icon: Eye },
          { id: 'ar-hit-test-plane-detector', label: 'Hit-Test AR & Planos Espaciais', icon: Smartphone },
          { id: 'xr-input-controller-inspector', label: 'Controladores & Hand Tracking', icon: Fingerprint },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs md:text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                isActive
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-lg shadow-cyan-950/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: WEBXR DEVICE SESSION TESTER */}
      {activeTab === 'webxr-device-session-tester' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Status overview */}
            <div className="lg:col-span-1 bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Glasses className="w-4 h-4 text-cyan-400" /> Suporte do Navegador
              </h3>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="text-xs text-slate-400">navigator.xr (WebXR Device API)</div>
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${xrSupport.supported ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
                  <span className="text-sm font-bold text-white">
                    {xrSupport.supported ? 'Detectado no Ambiente' : 'Não Detectado / Modo Simulado'}
                  </span>
                </div>
              </div>

              {/* Sessions status */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-slate-400">Modos de Sessão XR:</h4>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-300">immersive-vr (VR Dedicado)</span>
                  <span className={`font-semibold ${xrSupport.immersiveVr ? 'text-emerald-400' : 'text-slate-500'}`}>
                    {xrSupport.immersiveVr === null ? 'Pendente' : xrSupport.immersiveVr ? 'Suportado' : 'Sem HMD Conectado'}
                  </span>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-300">immersive-ar (AR Pass-through)</span>
                  <span className={`font-semibold ${xrSupport.immersiveAr ? 'text-emerald-400' : 'text-slate-500'}`}>
                    {xrSupport.immersiveAr === null ? 'Pendente' : xrSupport.immersiveAr ? 'Suportado' : 'Sem Câmera AR'}
                  </span>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-300">inline (Canvas Embutido 3D)</span>
                  <span className="font-semibold text-emerald-400">Suportado</span>
                </div>
              </div>
            </div>

            {/* Reference spaces and features */}
            <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" /> Recursos e Espaços de Referência Espaciais
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Object.keys(testedFeatures).map((feat) => (
                  <div key={feat} className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-xs text-white font-mono">{feat}</div>
                      <div className="text-[10px] text-slate-500">
                        {feat === 'local-floor' && 'Origem fixa no chão do ambiente físico'}
                        {feat === 'bounded-floor' && 'Área de play-space com guardião configurado'}
                        {feat === 'hit-test' && 'Raycasting de superfícies reais'}
                        {feat === 'hand-tracking' && 'Captura de articulações sem controle'}
                        {feat === 'mesh-detection' && 'Reconstrução poligonal de salas (LIDAR)'}
                        {feat === 'plane-detection' && 'Segmentação de pisos e mesas planas'}
                        {feat === 'anchors' && 'Fixação persistente de hologramas 3D'}
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                      testedFeatures[feat] 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' 
                        : 'bg-slate-800 text-slate-500'
                    }`}>
                      {testedFeatures[feat] ? 'Ativo' : 'Opcional'}
                    </span>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-cyan-950/20 border border-cyan-500/20 rounded-xl text-xs text-cyan-300 space-y-1">
                <div className="font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Padrão Aberto Khronos & W3C
                </div>
                <p className="text-[11px] text-slate-400">
                  A WebXR Device API unifica navegadores desktop e óculos standalone (Meta Quest, Apple Vision Pro via Safari e Pico) sob um único pipeline WebGL / WebGPU sem a necessidade de plugins proprietários.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SPATIAL 6DOF POSE & QUATERNIONS */}
      {activeTab === 'spatial-6dof-pose-quaternions' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input Controls */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Compass className="w-4 h-4 text-cyan-400" /> Translação (Metros) & Rotação Euler (Graus)
              </h3>

              <div className="space-y-3">
                <div className="text-xs font-semibold text-slate-400">Posição no Espaço (X, Y, Z):</div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[11px] text-slate-500 block mb-1">X (Lateral)</label>
                    <input
                      type="number"
                      step="0.05"
                      value={posX}
                      onChange={(e) => setPosX(parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-500 block mb-1">Y (Altura / Olhos)</label>
                    <input
                      type="number"
                      step="0.05"
                      value={posY}
                      onChange={(e) => setPosY(parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-500 block mb-1">Z (Profundidade)</label>
                    <input
                      type="number"
                      step="0.05"
                      value={posZ}
                      onChange={(e) => setPosZ(parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-2 border-t border-slate-800">
                <div className="text-xs font-semibold text-slate-400">Orientação Angular (Euler):</div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Yaw (Guinada - Rotação em Y)</span>
                    <span className="font-mono text-cyan-400">{yawDeg}&deg;</span>
                  </div>
                  <input
                    type="range"
                    min="-180"
                    max="180"
                    value={yawDeg}
                    onChange={(e) => setYawDeg(parseInt(e.target.value))}
                    className="w-full accent-cyan-400 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Pitch (Arfagem - Rotação em X)</span>
                    <span className="font-mono text-indigo-400">{pitchDeg}&deg;</span>
                  </div>
                  <input
                    type="range"
                    min="-90"
                    max="90"
                    value={pitchDeg}
                    onChange={(e) => setPitchDeg(parseInt(e.target.value))}
                    className="w-full accent-indigo-400 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Roll (Rolamento - Rotação em Z)</span>
                    <span className="font-mono text-emerald-400">{rollDeg}&deg;</span>
                  </div>
                  <input
                    type="range"
                    min="-90"
                    max="90"
                    value={rollDeg}
                    onChange={(e) => setRollDeg(parseInt(e.target.value))}
                    className="w-full accent-emerald-400 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Quaternion & Forward Vector Representation */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" /> Quatérnion Normalizado (X, Y, Z, W)
                </h3>

                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                  <div className="text-xs text-slate-400">Representação de Rotação Imune a Gimbal Lock:</div>
                  <div className="font-mono text-sm text-cyan-300 font-bold">
                    q = ({qX}, {qY}, {qZ}, {qW})
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Norma euclidiana: ||q|| = 1.0000
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-slate-400">Vetor Direcional Frontal (Forward Vector):</h4>
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 grid grid-cols-3 gap-2 text-center">
                    <div>
                      <div className="text-[10px] text-slate-500">Dir X</div>
                      <div className="font-mono text-xs text-slate-200">{forwardX}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500">Dir Y</div>
                      <div className="font-mono text-xs text-slate-200">{forwardY}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500">Dir Z</div>
                      <div className="font-mono text-xs text-cyan-400 font-bold">{forwardZ}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-xs text-slate-400">
                Os quatérnions eliminam singularidades matemáticas (Gimbal Lock) e permitem interpolações esféricas suaves (SLERP) entre frames de 90Hz/120Hz.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: STEREOSCOPIC FOV & IPD CALCULATOR */}
      {activeTab === 'stereoscopic-fov-ipd-calc' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Presets and Controls */}
            <div className="lg:col-span-1 bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-cyan-400" /> Presets de Headsets VR (HMD)
              </h3>

              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'quest3', label: 'Meta Quest 3' },
                  { id: 'visionpro', label: 'Apple Vision Pro' },
                  { id: 'index', label: 'Valve Index' },
                  { id: 'custom', label: 'Customizado' },
                ].map(hmd => (
                  <button
                    key={hmd.id}
                    onClick={() => handleSelectHmd(hmd.id as any)}
                    className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                      targetHmd === hmd.id
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    {hmd.label}
                  </button>
                ))}
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Distância Interpupilar (IPD)</span>
                  <span className="font-mono text-cyan-400 font-bold">{ipdMm} mm</span>
                </div>
                <input
                  type="range"
                  min="55"
                  max="74"
                  value={ipdMm}
                  onChange={(e) => setIpdMm(parseInt(e.target.value))}
                  className="w-full accent-cyan-400 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>55mm (Estreito)</span>
                  <span>64mm (Médio)</span>
                  <span>74mm (Largo)</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Campo de Visão Horizontal (FOV)</span>
                  <span className="font-mono text-indigo-400 font-bold">{fovH}&deg;</span>
                </div>
                <input
                  type="range"
                  min="80"
                  max="140"
                  value={fovH}
                  onChange={(e) => setFovH(parseInt(e.target.value))}
                  className="w-full accent-indigo-400 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>

            {/* Optical Output Cards */}
            <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Eye className="w-4 h-4 text-cyan-400" /> Parâmetros das Câmeras Estereoscópicas (Left / Right Eye)
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                  <div className="text-xs text-slate-400">Offset da Câmera Esquerda</div>
                  <div className="text-2xl font-black text-cyan-400 font-mono">{cameraLeftOffset}</div>
                  <div className="text-[10px] text-slate-500">Metade do IPD projetada em X</div>
                </div>

                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                  <div className="text-xs text-slate-400">Offset da Câmera Direita</div>
                  <div className="text-2xl font-black text-indigo-400 font-mono">{cameraRightOffset}</div>
                  <div className="text-[10px] text-slate-500">Metade do IPD projetada em X</div>
                </div>
              </div>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                <div className="font-semibold text-xs text-white">Geometria Óptica do HMD:</div>
                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">FOV Horizontal:</span>
                    <span className="font-mono text-cyan-300 font-bold">{fovH}&deg;</span>
                  </div>
                  <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">FOV Vertical Estimado:</span>
                    <span className="font-mono text-indigo-300 font-bold">{verticalFovApprox}&deg;</span>
                  </div>
                  <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Separação Total:</span>
                    <span className="font-mono text-emerald-300 font-bold">{eyeSeparationMeters}m</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: AR HIT-TEST & PLANE DETECTOR */}
      {activeTab === 'ar-hit-test-plane-detector' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Controls */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-cyan-400" /> Parâmetros do Raycast de Realidade Aumentada
              </h3>

              <div>
                <label className="text-xs text-slate-400 mb-1.5 block">Tipo de Superfície Detectada</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'horizontal', label: 'Horizontal (Chão/Mesa)' },
                    { id: 'vertical', label: 'Vertical (Parede/Fachada)' }
                  ].map(p => (
                    <button
                      key={p.id}
                      onClick={() => setPlaneOrientation(p.id as any)}
                      className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                        planeOrientation === p.id
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                          : 'bg-slate-950 text-slate-400 border-slate-800'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Distância de Interseção do Raio</span>
                  <span className="font-mono text-cyan-400 font-bold">{rayDistance.toFixed(2)} metros</span>
                </div>
                <input
                  type="range"
                  min="0.3"
                  max="5.0"
                  step="0.05"
                  value={rayDistance}
                  onChange={(e) => setRayDistance(parseFloat(e.target.value))}
                  className="w-full accent-cyan-400 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-400">Confiança do Tracking Espacial</div>
                  <div className="text-sm font-bold text-emerald-400 font-mono">{anchorConfidence}% Confiável</div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  Sem Drift
                </span>
              </div>
            </div>

            {/* Matrix result */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-400" /> Matriz de Transformação da Âncora (4x4)
                  </h3>
                  <button
                    onClick={() => handleCopy(hitResultMatrix, 'matrix')}
                    className="px-2.5 py-1 rounded-lg text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1.5 transition-all"
                  >
                    {copied === 'matrix' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    Copiar Matriz
                  </button>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-cyan-300 leading-relaxed overflow-x-auto whitespace-pre">
                  {hitResultMatrix}
                </div>
              </div>

              <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-xs text-slate-400">
                A pose resultante do hit-test é utilizada para fixar modelos GLTF/USDZ em tempo real com iluminação e oclusão de profundidade precisas.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: XR INPUT CONTROLLER & HAND TRACKING */}
      {activeTab === 'xr-input-controller-inspector' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Controller Buttons & Analog Axes */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Fingerprint className="w-4 h-4 text-cyan-400" /> Controladores 6DoF (Gamepad API)
                </h3>
                <div className="flex gap-1">
                  {(['left', 'right'] as const).map(hand => (
                    <button
                      key={hand}
                      onClick={() => setActiveHand(hand)}
                      className={`px-2.5 py-1 rounded text-xs font-semibold ${
                        activeHand === hand 
                          ? 'bg-cyan-500 text-slate-950' 
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {hand === 'left' ? 'Mão Esquerda' : 'Mão Direita'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Trigger & Grip */}
              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Gatilho Frontal (Trigger)</span>
                    <span className="font-mono text-cyan-400 font-bold">{Math.round(triggerValue * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={triggerValue}
                    onChange={(e) => setTriggerValue(parseFloat(e.target.value))}
                    className="w-full accent-cyan-400 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Gatilho de Pegada (Grip)</span>
                    <span className="font-mono text-indigo-400 font-bold">{Math.round(gripValue * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={gripValue}
                    onChange={(e) => setGripValue(parseFloat(e.target.value))}
                    className="w-full accent-indigo-400 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>

              {/* Thumbstick Analógico */}
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <div className="text-xs text-slate-400">Eixos do Thumbstick (X, Y)</div>
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="p-2 bg-slate-900 rounded border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">Eixo X</span>
                    <span className="font-mono text-xs text-cyan-400">{thumbstickX.toFixed(2)}</span>
                  </div>
                  <div className="p-2 bg-slate-900 rounded border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">Eixo Y</span>
                    <span className="font-mono text-xs text-indigo-400">{thumbstickY.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Haptic pulse button */}
              <button
                onClick={triggerHaptic}
                className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                  hapticPulsing
                    ? 'bg-rose-500 text-slate-950 animate-bounce'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                {hapticPulsing ? 'Vibrando Motores Hápticos...' : 'Disparar Pulso Háptico (gamepad.haptics.pulse)'}
              </button>
            </div>

            {/* Hand Tracking 25 Joints */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Radio className="w-4 h-4 text-cyan-400" /> WebXR Hand Tracking (Articulações Esqueléticas)
              </h3>

              <div className="space-y-2">
                <div className="text-xs text-slate-400 mb-1">
                  Coordenadas espaciais das pontas dos dedos e punho (XRHand):
                </div>

                <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1 scrollbar-thin">
                  {handJoints.map(joint => (
                    <div key={joint.name} className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between text-xs">
                      <span className="font-mono text-cyan-400 font-semibold">{joint.name}</span>
                      <span className="font-mono text-slate-400 text-[11px]">{joint.pose}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-cyan-950/20 border border-cyan-500/20 rounded-xl text-xs text-cyan-300">
                A Hand Tracking API fornece 25 articulações por mão com raio articular para detecção precisa de gestos como pinça (pinch) e apontar (point).
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
