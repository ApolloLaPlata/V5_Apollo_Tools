'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Headphones, 
  Volume2, 
  Radio, 
  Waves, 
  Sliders, 
  Play, 
  Pause, 
  RotateCcw, 
  Sparkles, 
  Copy, 
  Check, 
  Layers, 
  Zap, 
  Activity, 
  Cpu, 
  Box, 
  CheckCircle2, 
  Compass, 
  Speaker,
  Move3d
} from 'lucide-react';

export function SpatialAudioAndAmbisonicsSuite({ defaultTab = 'spatial-binaural-audio-panner' }: { defaultTab?: string }) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    try { if (navigator.clipboard?.writeText) navigator.clipboard.writeText(text).catch(() => {}); } catch {}
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  // -------------------------------------------------------------
  // TOOL 1: SPATIAL BINAURAL AUDIO PANNER (WEB AUDIO API 3D)
  // -------------------------------------------------------------
  const [sourcePos, setSourcePos] = useState({ x: 1.5, y: 0.0, z: -2.0 });
  const [listenerAngle, setListenerAngle] = useState(0); // degrees
  const [rolloffModel, setRolloffModel] = useState<'logarithmic' | 'linear' | 'exponential'>('logarithmic');
  const [refDistance, setRefDistance] = useState(1.0);
  const [maxDistance, setMaxDistance] = useState(10.0);
  const pannerCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Computed spatial metrics
  const distance = Math.sqrt(sourcePos.x * sourcePos.x + sourcePos.y * sourcePos.y + sourcePos.z * sourcePos.z);
  const azimuthRad = Math.atan2(sourcePos.x, -sourcePos.z);
  const azimuthDeg = Math.round((azimuthRad * 180) / Math.PI);
  const elevationRad = Math.atan2(sourcePos.y, Math.sqrt(sourcePos.x * sourcePos.x + sourcePos.z * sourcePos.z));
  const elevationDeg = Math.round((elevationRad * 180) / Math.PI);

  useEffect(() => {
    if (activeTab !== 'spatial-binaural-audio-panner') return;
    const canvas = pannerCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h / 2;
    const scale = 35; // px per meter

    ctx.fillStyle = '#020617';
    ctx.fillRect(0, 0, w, h);

    // Coordinate concentric circles (distance rings)
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    for (let r = 1; r <= 5; r++) {
      ctx.beginPath();
      ctx.arc(cx, cy, r * scale, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = '#475569';
      ctx.font = '9px monospace';
      ctx.fillText(`${r}m`, cx + r * scale + 3, cy - 3);
    }

    // Axes
    ctx.beginPath();
    ctx.moveTo(cx, 0); ctx.lineTo(cx, h);
    ctx.moveTo(0, cy); ctx.lineTo(w, cy);
    ctx.stroke();

    // Listener (Head) at Center with orientation nose
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate((listenerAngle * Math.PI) / 180);

    // Head circle
    ctx.fillStyle = '#06b6d4';
    ctx.beginPath();
    ctx.arc(0, 0, 14, 0, Math.PI * 2);
    ctx.fill();

    // Ears (binaural microphones)
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(-17, -4, 4, 8);
    ctx.fillRect(13, -4, 4, 8);

    // Nose (forward direction Z-)
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.moveTo(-4, -14);
    ctx.lineTo(4, -14);
    ctx.lineTo(0, -22);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Audio Source position (X, Z plane)
    const sx = cx + sourcePos.x * scale;
    const sy = cy + sourcePos.z * scale; // in Web Audio Z- is forward

    // Line from listener to source
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)';
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(sx, sy);
    ctx.stroke();
    ctx.setLineDash([]);

    // Sound wave pulse rings from source
    ctx.strokeStyle = 'rgba(236, 72, 153, 0.4)';
    ctx.lineWidth = 1.5;
    for (let pr = 10; pr <= 30; pr += 10) {
      ctx.beginPath();
      ctx.arc(sx, sy, pr, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Source Dot
    ctx.fillStyle = '#ec4899';
    ctx.shadowColor = '#ec4899';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(sx, sy, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

  }, [activeTab, sourcePos, listenerAngle]);

  // -------------------------------------------------------------
  // TOOL 2: AMBISONICS B-FORMAT DECODER (1ST ORDER W, X, Y, Z)
  // -------------------------------------------------------------
  const [ambiAzimuth, setAmbiAzimuth] = useState(45); // degrees
  const [ambiElevation, setAmbiElevation] = useState(0); // degrees
  const [speakerLayout, setSpeakerLayout] = useState<'stereo' | 'quad' | '5.1' | '7.1'>('5.1');

  // 1st order Ambisonics components (Furse-Malham / MaxN normalisation)
  const phi = (ambiAzimuth * Math.PI) / 180;
  const theta = (ambiElevation * Math.PI) / 180;

  const wCoeff = 0.7071; // Omni component (1 / sqrt(2))
  const xCoeff = Number((Math.cos(theta) * Math.cos(phi)).toFixed(4)); // Front-Back
  const yCoeff = Number((Math.cos(theta) * Math.sin(phi)).toFixed(4)); // Left-Right
  const zCoeff = Number(Math.sin(theta).toFixed(4)); // Up-Down

  // Decoded speaker feeds
  const decodeSpeakers = () => {
    if (speakerLayout === 'stereo') {
      return [
        { label: 'Left (L -30°)', gain: Number((0.5 * (wCoeff * 1.414 + 0.866 * xCoeff + 0.5 * yCoeff)).toFixed(3)) },
        { label: 'Right (R +30°)', gain: Number((0.5 * (wCoeff * 1.414 + 0.866 * xCoeff - 0.5 * yCoeff)).toFixed(3)) },
      ];
    } else if (speakerLayout === 'quad') {
      return [
        { label: 'Front-Left (FL -45°)', gain: Number((0.25 * (wCoeff + 0.707 * xCoeff + 0.707 * yCoeff)).toFixed(3)) },
        { label: 'Front-Right (FR +45°)', gain: Number((0.25 * (wCoeff + 0.707 * xCoeff - 0.707 * yCoeff)).toFixed(3)) },
        { label: 'Back-Left (BL -135°)', gain: Number((0.25 * (wCoeff - 0.707 * xCoeff + 0.707 * yCoeff)).toFixed(3)) },
        { label: 'Back-Right (BR +135°)', gain: Number((0.25 * (wCoeff - 0.707 * xCoeff - 0.707 * yCoeff)).toFixed(3)) },
      ];
    } else if (speakerLayout === '5.1') {
      return [
        { label: 'Center (C 0°)', gain: Number((0.3 * (wCoeff + xCoeff)).toFixed(3)) },
        { label: 'Front-Left (L -30°)', gain: Number((0.25 * (wCoeff + 0.866 * xCoeff + 0.5 * yCoeff)).toFixed(3)) },
        { label: 'Front-Right (R +30°)', gain: Number((0.25 * (wCoeff + 0.866 * xCoeff - 0.5 * yCoeff)).toFixed(3)) },
        { label: 'Surround-Left (SL -110°)', gain: Number((0.25 * (wCoeff - 0.342 * xCoeff + 0.939 * yCoeff)).toFixed(3)) },
        { label: 'Surround-Right (SR +110°)', gain: Number((0.25 * (wCoeff - 0.342 * xCoeff - 0.939 * yCoeff)).toFixed(3)) },
        { label: 'LFE (Subwoofer)', gain: Number((0.15 * wCoeff).toFixed(3)) }
      ];
    } else {
      return [
        { label: 'Center (C 0°)', gain: Number((0.25 * (wCoeff + xCoeff)).toFixed(3)) },
        { label: 'Front-Left (L -30°)', gain: Number((0.2 * (wCoeff + 0.866 * xCoeff + 0.5 * yCoeff)).toFixed(3)) },
        { label: 'Front-Right (R +30°)', gain: Number((0.2 * (wCoeff + 0.866 * xCoeff - 0.5 * yCoeff)).toFixed(3)) },
        { label: 'Side-Left (SL -90°)', gain: Number((0.2 * (wCoeff + yCoeff)).toFixed(3)) },
        { label: 'Side-Right (SR +90°)', gain: Number((0.2 * (wCoeff - yCoeff)).toFixed(3)) },
        { label: 'Back-Left (BL -150°)', gain: Number((0.2 * (wCoeff - 0.866 * xCoeff + 0.5 * yCoeff)).toFixed(3)) },
        { label: 'Back-Right (BR +150°)', gain: Number((0.2 * (wCoeff - 0.866 * xCoeff - 0.5 * yCoeff)).toFixed(3)) },
        { label: 'LFE Subwoofer', gain: Number((0.12 * wCoeff).toFixed(3)) }
      ];
    }
  };

  // -------------------------------------------------------------
  // TOOL 3: HRTF IMPULSE RESPONSE CONVOLVER & ITD/ILD
  // -------------------------------------------------------------
  const [hrtfAzimuth, setHrtfAzimuth] = useState(45); // degrees
  const [headDiameterCm, setHeadDiameterCm] = useState(17.5); // cm average head
  const speedOfSound = 343; // m/s

  // Woodworth formula for ITD (Interaural Time Difference)
  const headRadiusM = headDiameterCm / 200;
  const hrtfThetaRad = (Math.abs(hrtfAzimuth) * Math.PI) / 180;
  const itdSeconds = (headRadiusM / speedOfSound) * (hrtfThetaRad + Math.sin(hrtfThetaRad));
  const itdMicroseconds = Math.round(itdSeconds * 1e6);

  // Interaural Level Difference (ILD) approximation in dB (frequency dependent ~ 2kHz)
  const ildDb = Number((Math.sin(hrtfThetaRad) * 12.5).toFixed(1));

  // -------------------------------------------------------------
  // TOOL 4: ACOUSTIC ROOM REVERB SIMULATOR (SABINE RT60)
  // -------------------------------------------------------------
  const [roomLength, setRoomLength] = useState(8.0); // meters
  const [roomWidth, setRoomWidth] = useState(6.0); // meters
  const [roomHeight, setRoomHeight] = useState(3.0); // meters
  const [wallMaterial, setWallMaterial] = useState<'concrete' | 'drywall' | 'curtains' | 'acoustic_foam'>('drywall');

  const absorptionCoeffs = {
    concrete: 0.02,
    drywall: 0.08,
    curtains: 0.35,
    acoustic_foam: 0.75
  };

  const volume = roomLength * roomWidth * roomHeight;
  const surfaceArea = 2 * (roomLength * roomWidth + roomLength * roomHeight + roomWidth * roomHeight);
  const avgAlpha = absorptionCoeffs[wallMaterial];
  const totalAbsorption = surfaceArea * avgAlpha;
  // Sabine Equation: RT60 = 0.161 * V / A
  const rt60Sabine = Number(((0.161 * volume) / totalAbsorption).toFixed(2));

  // -------------------------------------------------------------
  // TOOL 5: AUDIOWORKLET MODULAR SYNTH (FM & ADSR)
  // -------------------------------------------------------------
  const [carrierFreq, setCarrierFreq] = useState(440);
  const [modulatorRatio, setModulatorRatio] = useState(2.0);
  const [modIndex, setModIndex] = useState(3.5);
  const [adsr, setAdsr] = useState({ a: 0.05, d: 0.2, s: 0.6, r: 0.4 });
  const [synthPlaying, setSynthPlaying] = useState(false);

  return (
    <div className="w-full bg-slate-950 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-8 shadow-2xl relative overflow-hidden text-slate-100">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold rounded-full flex items-center gap-1.5">
              <Headphones className="w-3.5 h-3.5" /> ÁUDIO ESPACIAL & DSP CLIENT-SIDE
            </span>
            <span className="px-2.5 py-1 bg-slate-800 text-slate-300 text-xs rounded-full font-mono">
              Marco de 425 Ferramentas
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            Suíte de Áudio Espacial 3D, Ambisonics & Convolução HRTF
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Ferramentas profissionais de áudio imersivo: Panner 3D binaural, decodificação de harmônicos esféricos B-Format, micro-atraso interaural ITD/ILD, acústica de Sabine RT60 e sintetizador FM por AudioWorklet.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-cyan-300 flex items-center gap-2">
            <Radio className="w-4 h-4 text-cyan-400" />
            <span>Capitania #11 · Web Audio DSP</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800 scrollbar-thin">
        {[
          { id: 'spatial-binaural-audio-panner', label: 'Panner Espacial Binaural 3D', icon: Move3d },
          { id: 'ambisonics-bformat-decoder', label: 'Decodificador Ambisonics B-Format', icon: Radio },
          { id: 'hrtf-impulse-response-convolver', label: 'Convolutor HRTF (ITD / ILD)', icon: Headphones },
          { id: 'acoustic-room-reverb-simulator', label: 'Reverb de Salas (Sabine RT60)', icon: Box },
          { id: 'audioworklet-modular-synth', label: 'Sintetizador FM AudioWorklet', icon: Waves },
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

      {/* TAB 1: SPATIAL BINAURAL AUDIO PANNER */}
      {activeTab === 'spatial-binaural-audio-panner' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Compass className="w-4 h-4 text-cyan-400" /> Radar 2D/3D de Posicionamento Espacial
                </h3>
                <span className="text-xs text-slate-400 font-mono">
                  Distância: <strong className="text-cyan-400">{distance.toFixed(2)} m</strong>
                </span>
              </div>

              <div className="relative w-full aspect-[5/3.5] bg-slate-950 rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center">
                <canvas
                  ref={pannerCanvasRef}
                  width={500}
                  height={350}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="grid grid-cols-3 gap-3 text-center text-xs">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="text-slate-500 text-[10px]">Ângulo Azimutal ($\theta$)</div>
                  <div className="text-sm font-bold text-cyan-400 font-mono">{azimuthDeg}°</div>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="text-slate-500 text-[10px]">Ângulo de Elevação ($\phi$)</div>
                  <div className="text-sm font-bold text-purple-400 font-mono">{elevationDeg}°</div>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="text-slate-500 text-[10px]">Atenuação de Ganho</div>
                  <div className="text-sm font-bold text-emerald-400 font-mono">
                    {Number(Math.max(0.05, 1 / (1 + (distance - refDistance))).toFixed(2))}x (-{Math.round(20 * Math.log10(Math.max(1, distance)))} dB)
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-5">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-cyan-400" /> Coordenadas da Fonte Sonora
              </h3>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-1.5">
                    <span>Eixo X (Esquerda ↔ Direita)</span>
                    <span className="font-mono text-cyan-400">{sourcePos.x.toFixed(1)} m</span>
                  </div>
                  <input
                    type="range"
                    min="-4.0"
                    max="4.0"
                    step="0.1"
                    value={sourcePos.x}
                    onChange={(e) => setSourcePos({ ...sourcePos, x: parseFloat(e.target.value) || 0 })}
                    className="w-full accent-cyan-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-1.5">
                    <span>Eixo Z (Frente ↔ Trás)</span>
                    <span className="font-mono text-pink-400">{sourcePos.z.toFixed(1)} m</span>
                  </div>
                  <input
                    type="range"
                    min="-4.0"
                    max="4.0"
                    step="0.1"
                    value={sourcePos.z}
                    onChange={(e) => setSourcePos({ ...sourcePos, z: parseFloat(e.target.value) || 0 })}
                    className="w-full accent-pink-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-1.5">
                    <span>Eixo Y (Elevação Altura)</span>
                    <span className="font-mono text-purple-400">{sourcePos.y.toFixed(1)} m</span>
                  </div>
                  <input
                    type="range"
                    min="-2.0"
                    max="2.0"
                    step="0.1"
                    value={sourcePos.y}
                    onChange={(e) => setSourcePos({ ...sourcePos, y: parseFloat(e.target.value) || 0 })}
                    className="w-full accent-purple-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-1.5">
                    <span>Orientação da Cabeça (Yaw)</span>
                    <span className="font-mono text-amber-400">{listenerAngle}°</span>
                  </div>
                  <input
                    type="range"
                    min="-180"
                    max="180"
                    step="5"
                    value={listenerAngle}
                    onChange={(e) => setListenerAngle(parseInt(e.target.value) || 0)}
                    className="w-full accent-amber-500"
                  />
                </div>

                <div className="p-3 bg-cyan-950/20 border border-cyan-500/20 rounded-xl text-xs text-cyan-300 space-y-1">
                  <div className="font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" /> Web Audio PannerNode
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    O modelo <code>HRTF</code> utiliza convolução estéreo binaural para sintetizar a filtragem do pavilhão auricular e atraso interaural exato em fones de ouvido.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: AMBISONICS B-FORMAT DECODER */}
      {activeTab === 'ambisonics-bformat-decoder' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Radio className="w-4 h-4 text-cyan-400" /> Canais B-Format de 1ª Ordem
              </h3>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-1.5">
                    <span>Azimute da Fonte ($\theta$)</span>
                    <span className="font-mono text-cyan-400">{ambiAzimuth}°</span>
                  </div>
                  <input
                    type="range"
                    min="-180"
                    max="180"
                    step="5"
                    value={ambiAzimuth}
                    onChange={(e) => setAmbiAzimuth(parseInt(e.target.value) || 0)}
                    className="w-full accent-cyan-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-1.5">
                    <span>Elevação da Fonte ($\phi$)</span>
                    <span className="font-mono text-purple-400">{ambiElevation}°</span>
                  </div>
                  <input
                    type="range"
                    min="-90"
                    max="90"
                    step="5"
                    value={ambiElevation}
                    onChange={(e) => setAmbiElevation(parseInt(e.target.value) || 0)}
                    className="w-full accent-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-500">Canal W (Omni)</div>
                  <div className="text-base font-bold text-amber-400 font-mono">{wCoeff}</div>
                  <div className="text-[9px] text-slate-400">Pressão Escalar</div>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-500">Canal X (Frente/Trás)</div>
                  <div className="text-base font-bold text-cyan-400 font-mono">{xCoeff}</div>
                  <div className="text-[9px] text-slate-400">Dipolo $\cos\theta$</div>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-500">Canal Y (Esq/Dir)</div>
                  <div className="text-base font-bold text-pink-400 font-mono">{yCoeff}</div>
                  <div className="text-[9px] text-slate-400">Dipolo $\sin\theta$</div>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-500">Canal Z (Cima/Baixo)</div>
                  <div className="text-base font-bold text-emerald-400 font-mono">{zCoeff}</div>
                  <div className="text-[9px] text-slate-400">Dipolo $\sin\phi$</div>
                </div>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-400 leading-relaxed font-mono">
                {'W = S / sqrt(2)'}<br />
                {'X = S * cos(elevation) * cos(azimuth)'}<br />
                {'Y = S * cos(elevation) * sin(azimuth)'}<br />
                {'Z = S * sin(elevation)'}
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Speaker className="w-4 h-4 text-emerald-400" /> Decodificação para Caixas Acústicas
                </h3>
                <div className="flex gap-1.5">
                  {(['stereo', 'quad', '5.1', '7.1'] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setSpeakerLayout(mode)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold uppercase transition-all ${
                        speakerLayout === mode
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                {decodeSpeakers().map((spk, idx) => (
                  <div key={idx} className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                    <span className="text-xs text-slate-300 font-medium">{spk.label}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-emerald-500 to-cyan-400 h-full rounded-full"
                          style={{ width: `${Math.min(100, Math.max(0, spk.gain * 120))}%` }}
                        />
                      </div>
                      <span className="text-xs font-mono font-bold text-emerald-400 w-12 text-right">
                        {spk.gain.toFixed(3)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3 bg-emerald-950/20 border border-emerald-500/20 rounded-xl text-xs text-emerald-300">
                A tecnologia Ambisonics é independente de canal. Uma gravação em B-Format de 4 canais pode ser decodificada para qualquer disposição física de caixas ou fones binaurais sem re-gravação.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: HRTF IMPULSE RESPONSE CONVOLVER */}
      {activeTab === 'hrtf-impulse-response-convolver' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Headphones className="w-4 h-4 text-cyan-400" /> Parâmetros Psicoacústicos Interaurais
              </h3>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-1.5">
                    <span>Azimute da Fonte em Relação ao Ouvinte</span>
                    <span className="font-mono text-cyan-400">{hrtfAzimuth}°</span>
                  </div>
                  <input
                    type="range"
                    min="-90"
                    max="90"
                    step="5"
                    value={hrtfAzimuth}
                    onChange={(e) => setHrtfAzimuth(parseInt(e.target.value) || 0)}
                    className="w-full accent-cyan-500"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                    <span>-90° (Ouvido Esquerdo)</span>
                    <span>0° (Frente)</span>
                    <span>+90° (Ouvido Direito)</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-1.5">
                    <span>Diâmetro Craniano Médio ($d$)</span>
                    <span className="font-mono text-purple-400">{headDiameterCm} cm</span>
                  </div>
                  <input
                    type="range"
                    min="14.0"
                    max="22.0"
                    step="0.5"
                    value={headDiameterCm}
                    onChange={(e) => setHeadDiameterCm(parseFloat(e.target.value) || 0)}
                    className="w-full accent-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-500">ITD (Interaural Time Diff)</div>
                  <div className="text-xl font-bold font-mono text-cyan-400">{itdMicroseconds} µs</div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    {hrtfAzimuth > 0 ? 'Chega antes no ouvido direito' : hrtfAzimuth < 0 ? 'Chega antes no ouvido esquerdo' : 'Em fase perfeita'}
                  </div>
                </div>

                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-500">ILD (Interaural Level Diff)</div>
                  <div className="text-xl font-bold font-mono text-emerald-400">Δ {ildDb} dB</div>
                  <div className="text-[10px] text-slate-400 mt-1">Atenuação por Sombra da Cabeça</div>
                </div>
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" /> Modelo Esférico de Woodworth & Arquivos SOFA
              </h3>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-2 font-mono">
                <div className="text-slate-500">// Fórmula Analítica de Woodworth (1938)</div>
                <div className="text-cyan-400">{'ITD = (r / c) * (θ + sin θ)'}</div>
                <div className="text-slate-400">r = raio da cabeça ({(headRadiusM).toFixed(3)} m)</div>
                <div className="text-slate-400">c = velocidade do som (343 m/s)</div>
              </div>

              <div className="p-3 bg-purple-950/20 border border-purple-500/20 rounded-xl text-xs text-purple-300 space-y-2">
                <div className="font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Integração com Formato SOFA (AES69)
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  O padrão SOFA (Spatially Oriented Format for Acoustics) armazena pares de respostas ao impulso (IR) medidos com microfones intra-auriculares para centenas de pontos esféricos ao redor do usuário, gerando localização 3D realista através do nó <code>ConvolverNode</code> da Web Audio API.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: ACOUSTIC ROOM REVERB SIMULATOR */}
      {activeTab === 'acoustic-room-reverb-simulator' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Box className="w-4 h-4 text-cyan-400" /> Geometria e Superfícies da Sala
              </h3>

              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Comprimento (m)</label>
                    <input
                      type="number"
                      step="0.5"
                      min="2"
                      max="30"
                      value={roomLength}
                      onChange={(e) => setRoomLength(parseFloat(e.target.value) || 2)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs font-mono text-cyan-400"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Largura (m)</label>
                    <input
                      type="number"
                      step="0.5"
                      min="2"
                      max="30"
                      value={roomWidth}
                      onChange={(e) => setRoomWidth(parseFloat(e.target.value) || 2)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs font-mono text-purple-400"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Altura (m)</label>
                    <input
                      type="number"
                      step="0.5"
                      min="2"
                      max="10"
                      value={roomHeight}
                      onChange={(e) => setRoomHeight(parseFloat(e.target.value) || 2)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs font-mono text-emerald-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1.5">Material de Revestimento Acústico</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'concrete', label: 'Concreto Liso (α = 0.02)' },
                      { id: 'drywall', label: 'Gesso / Drywall (α = 0.08)' },
                      { id: 'curtains', label: 'Cortinas Pesadas (α = 0.35)' },
                      { id: 'acoustic_foam', label: 'Espuma Sonex (α = 0.75)' },
                    ].map((mat) => (
                      <button
                        key={mat.id}
                        onClick={() => setWallMaterial(mat.id as any)}
                        className={`p-2.5 rounded-xl text-xs font-medium text-left border transition-all ${
                          wallMaterial === mat.id
                            ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                            : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                        }`}
                      >
                        {mat.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center text-xs">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-500">Volume Total ($V$)</div>
                  <div className="text-sm font-bold text-cyan-400 font-mono">{volume.toFixed(1)} m³</div>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-500">Área de Superfície ($S$)</div>
                  <div className="text-sm font-bold text-purple-400 font-mono">{surfaceArea.toFixed(1)} m²</div>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-500">Absorção ($A$)</div>
                  <div className="text-sm font-bold text-emerald-400 font-mono">{totalAbsorption.toFixed(1)} Sabins</div>
                </div>
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Waves className="w-4 h-4 text-emerald-400" /> Tempo de Reverberação RT60 de Sabine
              </h3>

              <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800 text-center space-y-2">
                <div className="text-xs text-slate-500">Tempo de Decaimento de 60 dB ($RT_{60}$)</div>
                <div className={`text-4xl font-black font-mono ${rt60Sabine > 2.0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {rt60Sabine} s
                </div>
                <div className="text-xs text-slate-400">
                  {rt60Sabine < 0.4 ? 'Ambiente Seco / Estúdio de Locução' : rt60Sabine < 1.2 ? 'Sala de Música / Auditório Ideal' : 'Catedral / Espaço Muito Reverberante'}
                </div>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300 font-mono space-y-1">
                <div className="text-slate-500">// Equação Clássica de Wallace Sabine (1898)</div>
                <div className="text-cyan-400">{'RT60 = 0.161 * (Volume / AbsorcaoTotal)'}</div>
                <div className="text-slate-400">{'RT60 = 0.161 * ('}{volume.toFixed(1)}{' / '}{totalAbsorption.toFixed(1)}{') = '}{rt60Sabine}{' s'}</div>
              </div>

              <div className="p-3 bg-cyan-950/20 border border-cyan-500/20 rounded-xl text-xs text-cyan-300">
                Pode ser convertido para um nó <code>ConvolverNode</code> da Web Audio API gerando um impulso de ruído branco exponencialmente amortecido com tau = RT60 / 6.91.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: AUDIOWORKLET MODULAR SYNTH */}
      {activeTab === 'audioworklet-modular-synth' && (
        <div className="space-y-6">
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Waves className="w-5 h-5 text-cyan-400" /> Sintetizador FM & Gerador de Código AudioWorklet
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Síntese de Modulação em Frequência (Chowning FM) processada em thread dedicada com latência ultra-baixa.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopy(
`// AudioWorkletProcessor em tempo real para Síntese FM
class FmSynthProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.phaseCarrier = 0;
    this.phaseMod = 0;
  }
  process(inputs, outputs, parameters) {
    const output = outputs[0];
    const channel = output[0];
    const fc = ${carrierFreq};
    const fm = ${carrierFreq * modulatorRatio};
    const index = ${modIndex};
    for (let i = 0; i < channel.length; ++i) {
      const mod = Math.sin(this.phaseMod) * index;
      channel[i] = Math.sin(this.phaseCarrier + mod) * 0.25;
      this.phaseCarrier += (2 * Math.PI * fc) / sampleRate;
      this.phaseMod += (2 * Math.PI * fm) / sampleRate;
    }
    return true;
  }
}
registerProcessor('fm-synth-processor', FmSynthProcessor);`,
                    'audioworklet-code'
                  )}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all"
                >
                  {copied === 'audioworklet-code' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-cyan-400" />}
                  <span>{copied === 'audioworklet-code' ? 'Copiado!' : 'Copiar AudioWorklet.js'}</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                <div className="flex justify-between text-xs text-slate-300">
                  <span>Frequência Portadora (Carrier):</span>
                  <span className="font-mono text-cyan-400">{carrierFreq} Hz</span>
                </div>
                <input
                  type="range"
                  min="55"
                  max="880"
                  step="5"
                  value={carrierFreq}
                  onChange={(e) => setCarrierFreq(parseInt(e.target.value) || 0)}
                  className="w-full accent-cyan-500"
                />

                <div className="flex justify-between text-xs text-slate-300">
                  <span>Razão Moduladora (Mod/Car):</span>
                  <span className="font-mono text-purple-400">{modulatorRatio}x ({(carrierFreq * modulatorRatio).toFixed(1)} Hz)</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="8.0"
                  step="0.5"
                  value={modulatorRatio}
                  onChange={(e) => setModulatorRatio(parseFloat(e.target.value) || 0)}
                  className="w-full accent-purple-500"
                />

                <div className="flex justify-between text-xs text-slate-300">
                  <span>Índice de Modulação ($\beta$):</span>
                  <span className="font-mono text-emerald-400">{modIndex}</span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="12.0"
                  step="0.2"
                  value={modIndex}
                  onChange={(e) => setModIndex(parseFloat(e.target.value) || 0)}
                  className="w-full accent-emerald-500"
                />
              </div>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                <div className="text-xs font-semibold text-white mb-2">Envelope ADSR (Tempo em segundos)</div>
                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                  <div>
                    <div className="text-[10px] text-slate-500">Attack</div>
                    <div className="font-mono text-cyan-400">{adsr.a}s</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500">Decay</div>
                    <div className="font-mono text-purple-400">{adsr.d}s</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500">Sustain</div>
                    <div className="font-mono text-emerald-400">{adsr.s}x</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500">Release</div>
                    <div className="font-mono text-pink-400">{adsr.r}s</div>
                  </div>
                </div>

                <div className="h-20 bg-slate-900 rounded-lg flex items-end p-2 border border-slate-800 gap-1">
                  <div className="bg-cyan-500 h-full w-1/4 rounded-sm opacity-80" />
                  <div className="bg-purple-500 h-3/4 w-1/4 rounded-sm opacity-80" />
                  <div className="bg-emerald-500 h-1/2 w-1/4 rounded-sm opacity-80" />
                  <div className="bg-pink-500 h-1/4 w-1/4 rounded-sm opacity-80" />
                </div>
              </div>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex flex-col justify-between space-y-3">
                <div>
                  <div className="text-xs font-semibold text-white mb-1">Timbre Gerado:</div>
                  <div className="text-xs text-slate-400">
                    {modIndex < 1 ? 'Som Senoidal Puro e Suave' : modIndex < 4 ? 'Harmônicos Metálicos tipo Sino / E-Piano' : 'Timbre Áspero, Distorcido e Rico em Banda Lateral'}
                  </div>
                </div>

                <div className="p-3 bg-cyan-950/20 border border-cyan-500/20 rounded-xl text-xs text-cyan-300">
                  O <code>AudioWorkletNode</code> executa o cálculo de síntese na thread de áudio de alta prioridade, garantindo zero glitches mesmo durante renderizações de layout na thread principal.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}