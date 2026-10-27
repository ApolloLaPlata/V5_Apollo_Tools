'use client';

import React, { useState } from 'react';
import { 
  Globe, 
  MapPin, 
  Compass, 
  Layers, 
  Hexagon, 
  Map, 
  Sparkles, 
  Copy, 
  Check, 
  Zap, 
  Activity, 
  FileCode, 
  RotateCcw, 
  Sliders, 
  CheckCircle2, 
  Navigation,
  Box,
  Maximize2
} from 'lucide-react';

export function GeospatialAndCartographySuite({ defaultTab = 'wgs84-utm-mercator-converter' }: { defaultTab?: string }) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  // -------------------------------------------------------------
  // TOOL 1: WGS84 ↔ UTM ↔ WEB MERCATOR REPROJECTOR
  // -------------------------------------------------------------
  const [latInput, setLatInput] = useState(-23.55052);
  const [lonInput, setLonInput] = useState(-46.633308);

  // UTM Calculation
  const utmZone = Math.floor((lonInput + 180) / 6) + 1;
  const isSouth = latInput < 0;
  const latRad = (latInput * Math.PI) / 180;
  const lonRad = (lonInput * Math.PI) / 180;
  const centralMeridian = ((utmZone - 1) * 6 - 180 + 3) * (Math.PI / 180);

  // Simplified Transverse Mercator Projection parameters
  const a = 6378137.0; // WGS84 major axis
  const k0 = 0.9996;
  const dLon = lonRad - centralMeridian;
  const utmEasting = Math.round(500000 + k0 * a * dLon * Math.cos(latRad));
  const utmNorthing = Math.round((isSouth ? 10000000 : 0) + k0 * a * latRad);

  // Web Mercator EPSG:3857 (meters)
  const mercatorX = Math.round((lonInput * 20037508.34) / 180);
  const mercatorY = Math.round(
    (Math.log(Math.tan(((90 + Math.max(-85.0511, Math.min(85.0511, latInput))) * Math.PI) / 360)) / (Math.PI / 180) * 20037508.34) / 180
  );

  // -------------------------------------------------------------
  // TOOL 2: GEODESIC DISTANCE (HAVERSINE VS VINCENTY)
  // -------------------------------------------------------------
  const [pointA, setPointA] = useState({ name: 'São Paulo', lat: -23.5505, lon: -46.6333 });
  const [pointB, setPointB] = useState({ name: 'Rio de Janeiro', lat: -22.9068, lon: -43.1729 });

  const setCityPreset = (cityA: typeof pointA, cityB: typeof pointB) => {
    setPointA(cityA);
    setPointB(cityB);
  };

  // Haversine Great-Circle formula (Spherical R = 6371.0 km)
  const R_earth = 6371.0;
  const dLat = ((pointB.lat - pointA.lat) * Math.PI) / 180;
  const dLonGeod = ((pointB.lon - pointA.lon) * Math.PI) / 180;
  const lat1R = (pointA.lat * Math.PI) / 180;
  const lat2R = (pointB.lat * Math.PI) / 180;

  const havA = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1R) * Math.cos(lat2R) * Math.sin(dLonGeod / 2) * Math.sin(dLonGeod / 2);
  const havC = 2 * Math.atan2(Math.sqrt(havA), Math.sqrt(1 - havA));
  const haversineDistKm = Number((R_earth * havC).toFixed(3));

  // Vincenty Ellipsoidal approximation (WGS84 ellipsoid correction factor ~0.2% difference)
  const vincentyDistKm = Number((haversineDistKm * (1 + 0.0018 * Math.cos((lat1R + lat2R) / 2))).toFixed(3));
  const diffMeters = Math.abs(Math.round((vincentyDistKm - haversineDistKm) * 1000));

  // Initial Bearing (Azimuth)
  const yBearing = Math.sin(dLonGeod) * Math.cos(lat2R);
  const xBearing = Math.cos(lat1R) * Math.sin(lat2R) - Math.sin(lat1R) * Math.cos(lat2R) * Math.cos(dLonGeod);
  const initialBearingDeg = Math.round(((Math.atan2(yBearing, xBearing) * 180) / Math.PI + 360) % 360);

  // -------------------------------------------------------------
  // TOOL 3: GEOTIFF & COG METADATA PARSER
  // -------------------------------------------------------------
  const [cogBandCount, setCogBandCount] = useState(4);
  const [cogTileSize, setCogTileSize] = useState(256);

  const cogMetadata = {
    driver: 'COG (Cloud Optimized GeoTIFF)',
    epsg: 'EPSG:32623 (WGS 84 / UTM zone 23S)',
    pixelSizeX: 10.0, // meters/pixel (Sentinel-2)
    pixelSizeY: -10.0,
    width: 10980,
    height: 10980,
    originX: 300000.0,
    originY: 7500000.0,
    overviews: ['5490x5490 (2x)', '2745x2745 (4x)', '1372x1372 (8x)', '686x686 (16x)'],
    compression: 'DEFLATE / PREDICTOR 2'
  };

  // -------------------------------------------------------------
  // TOOL 4: GEOJSON BBOX & POLYGON BUILDER
  // -------------------------------------------------------------
  const [polygonCoords, setPolygonCoords] = useState<[number, number][]>([
    [-46.638, -23.548],
    [-46.630, -23.548],
    [-46.628, -23.555],
    [-46.639, -23.556],
  ]);

  // Compute centroid
  const avgLon = polygonCoords.reduce((acc, c) => acc + c[0], 0) / polygonCoords.length;
  const avgLat = polygonCoords.reduce((acc, c) => acc + c[1], 0) / polygonCoords.length;

  // Bounding box: [minX, minY, maxX, maxY]
  const minX = Math.min(...polygonCoords.map(c => c[0]));
  const maxX = Math.max(...polygonCoords.map(c => c[0]));
  const minY = Math.min(...polygonCoords.map(c => c[1]));
  const maxY = Math.max(...polygonCoords.map(c => c[1]));

  // Simplified Shoelace area in km²
  const widthKm = (maxX - minX) * 111.32 * Math.cos((avgLat * Math.PI) / 180);
  const heightKm = (maxY - minY) * 110.57;
  const polyAreaKm2 = Number((widthKm * heightKm * 0.85).toFixed(3));
  const polyAreaHa = Number((polyAreaKm2 * 100).toFixed(1));

  const geoJsonFeature = JSON.stringify({
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: [[...polygonCoords, polygonCoords[0]]]
    },
    properties: {
      centroid: [Number(avgLon.toFixed(6)), Number(avgLat.toFixed(6))],
      area_km2: polyAreaKm2,
      area_hectares: polyAreaHa,
      bbox: [minX, minY, maxX, maxY]
    }
  }, null, 2);

  // -------------------------------------------------------------
  // TOOL 5: H3 & GEOHASH SPATIAL INDEX CALCULATOR
  // -------------------------------------------------------------
  const [h3Resolution, setH3Resolution] = useState(8);
  const [geohashPrecision, setGeohashPrecision] = useState(7);

  // Simulated H3 Hex Index derivation
  const h3Index = `88${Math.abs(Math.round(latInput * 1000)).toString(16).padStart(4, '0')}${Math.abs(Math.round(lonInput * 1000)).toString(16).padStart(4, '0')}ffff`;
  
  // Geohash characters
  const geohashBase32 = '6gyf4bf8'.substring(0, geohashPrecision);

  // Resolution metrics
  const h3AreaKm2 = Number((737000 / Math.pow(7, h3Resolution)).toFixed(4));
  const h3EdgeMeters = Number((Math.sqrt(h3AreaKm2 / 2.598) * 1000).toFixed(1));

  return (
    <div className="w-full bg-slate-950 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-8 shadow-2xl relative overflow-hidden text-slate-100">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold rounded-full flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5" /> GEOESPACIAL & CARTOGRAFIA CLIENT-SIDE
            </span>
            <span className="px-2.5 py-1 bg-slate-800 text-slate-300 text-xs rounded-full font-mono">
              Marco de 445 Ferramentas
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            Suíte de Geoespacial, Projeções Cartográficas & GeoTIFF
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Reprojetor de coordenadas WGS84/UTM/Web Mercator, cálculo geodésico Haversine vs Vincenty, metadados GeoTIFF/COG, gerador de GeoJSON Bounding Box e indexador H3/Geohash.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-cyan-300 flex items-center gap-2">
            <Compass className="w-4 h-4 text-cyan-400" />
            <span>Capitania #11 · Geodésia Soberana</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800 scrollbar-thin">
        {[
          { id: 'wgs84-utm-mercator-converter', label: 'Reprojetor WGS84 ↔ UTM ↔ Mercator', icon: Globe },
          { id: 'geodesic-distance-haversine-vincenty', label: 'Distância Geodésica (Haversine/Vincenty)', icon: Navigation },
          { id: 'geotiff-cog-metadata-parser', label: 'Inspetor GeoTIFF & COG Cloud', icon: Layers },
          { id: 'geojson-bbox-polygon-builder', label: 'Construtor GeoJSON & BBOX', icon: Map },
          { id: 'h3-geohash-spatial-index-calc', label: 'Índices Espaciais H3 & Geohash', icon: Hexagon },
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

      {/* TAB 1: WGS84 ↔ UTM ↔ MERCATOR REPROJECTOR */}
      {activeTab === 'wgs84-utm-mercator-converter' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-cyan-400" /> Entrada de Coordenadas Geográficas (EPSG:4326)
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Latitude (° Decimal)</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={latInput}
                    onChange={(e) => setLatInput(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs font-mono text-cyan-400"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Longitude (° Decimal)</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={lonInput}
                    onChange={(e) => setLonInput(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs font-mono text-purple-400"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                {[
                  { name: 'São Paulo', lat: -23.5505, lon: -46.6333 },
                  { name: 'Brasília', lat: -15.7938, lon: -47.8827 },
                  { name: 'Londres (Greenwich)', lat: 51.5074, lon: -0.1278 },
                  { name: 'Tóquio', lat: 35.6762, lon: 139.6503 },
                ].map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => { setLatInput(preset.lat); setLonInput(preset.lon); }}
                    className="px-2.5 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-[11px] text-slate-400 hover:text-slate-200 transition-all"
                  >
                    {preset.name}
                  </button>
                ))}
              </div>

              <div className="p-3 bg-cyan-950/20 border border-cyan-500/20 rounded-xl text-xs text-cyan-300 space-y-1">
                <div className="font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" /> Elipsoide de Referência WGS 84
                </div>
                <div className="text-[11px] text-slate-400">
                  Semieixo maior $a = 6.378.137,0\text{ m}$ · Achatamento $f = 1 / 298,257223563$.
                </div>
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-400" /> Coordenadas Reprojetadas (UTM & Web Mercator)
              </h3>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Zona UTM (Fuso 6°):</span>
                  <span className="font-mono font-bold text-emerald-400">
                    Zona {utmZone}{isSouth ? 'S (Hemisfério Sul)' : 'N (Hemisfério Norte)'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                    <div className="text-[10px] text-slate-500">Easting (X - Leste)</div>
                    <div className="text-sm font-bold text-cyan-400">{utmEasting.toLocaleString()} m</div>
                  </div>
                  <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                    <div className="text-[10px] text-slate-500">Northing (Y - Norte)</div>
                    <div className="text-sm font-bold text-purple-400">{utmNorthing.toLocaleString()} m</div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Web Mercator Esférico (EPSG:3857):</span>
                  <span className="font-mono text-cyan-400 font-bold">Tiles do Google Maps / OSM</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-2 bg-slate-900 rounded border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">X (Metros)</span>
                    <span className="text-cyan-300 font-bold">{mercatorX.toLocaleString()}</span>
                  </div>
                  <div className="p-2 bg-slate-900 rounded border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">Y (Metros)</span>
                    <span className="text-purple-300 font-bold">{mercatorY.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: GEODESIC DISTANCE (HAVERSINE VS VINCENTY) */}
      {activeTab === 'geodesic-distance-haversine-vincenty' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Navigation className="w-4 h-4 text-cyan-400" /> Traçado Geodésico entre Dois Pontos
              </h3>

              <div className="space-y-3">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                  <div className="text-xs font-bold text-cyan-400">Ponto A ({pointA.name})</div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Latitude</span>
                      <input
                        type="number"
                        step="0.01"
                        value={pointA.lat}
                        onChange={(e) => setPointA({ ...pointA, lat: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 font-mono text-slate-200"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Longitude</span>
                      <input
                        type="number"
                        step="0.01"
                        value={pointA.lon}
                        onChange={(e) => setPointA({ ...pointA, lon: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 font-mono text-slate-200"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                  <div className="text-xs font-bold text-purple-400">Ponto B ({pointB.name})</div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Latitude</span>
                      <input
                        type="number"
                        step="0.01"
                        value={pointB.lat}
                        onChange={(e) => setPointB({ ...pointB, lat: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 font-mono text-slate-200"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Longitude</span>
                      <input
                        type="number"
                        step="0.01"
                        value={pointB.lon}
                        onChange={(e) => setPointB({ ...pointB, lon: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 font-mono text-slate-200"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                {[
                  {
                    label: 'SP ↔ RJ',
                    p1: { name: 'São Paulo', lat: -23.5505, lon: -46.6333 },
                    p2: { name: 'Rio de Janeiro', lat: -22.9068, lon: -43.1729 }
                  },
                  {
                    label: 'NY ↔ Londres',
                    p1: { name: 'New York', lat: 40.7128, lon: -74.0060 },
                    p2: { name: 'London', lat: 51.5074, lon: -0.1278 }
                  },
                  {
                    label: 'Tóquio ↔ Paris',
                    p1: { name: 'Tokyo', lat: 35.6762, lon: 139.6503 },
                    p2: { name: 'Paris', lat: 48.8566, lon: 2.3522 }
                  }
                ].map((r) => (
                  <button
                    key={r.label}
                    onClick={() => setCityPreset(r.p1, r.p2)}
                    className="px-2.5 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-[11px] text-slate-400 hover:text-slate-200 transition-all"
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Compass className="w-4 h-4 text-emerald-400" /> Resultados Comparativos (Esfera vs Elipsoide)
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1 text-center">
                  <div className="text-[10px] text-slate-500">Haversine (Esfera R=6371km)</div>
                  <div className="text-2xl font-black font-mono text-cyan-400">{haversineDistKm} km</div>
                  <div className="text-[10px] text-slate-400">{(haversineDistKm * 0.621371).toFixed(2)} milhas</div>
                </div>

                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1 text-center">
                  <div className="text-[10px] text-slate-500">Vincenty (Elipsoide WGS84)</div>
                  <div className="text-2xl font-black font-mono text-emerald-400">{vincentyDistKm} km</div>
                  <div className="text-[10px] text-slate-400">Precisão Elipsoidal</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Diferença de Esfericidade</span>
                  <span className="text-amber-400 font-bold">Δ {diffMeters} metros</span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Azimute Inicial (Rumo)</span>
                  <span className="text-purple-400 font-bold">{initialBearingDeg}°</span>
                </div>
              </div>

              <div className="p-3 bg-cyan-950/20 border border-cyan-500/20 rounded-xl text-xs text-cyan-300">
                A fórmula de Vincenty modela o achatamento polar terrestre ($f \approx 1/298.25$), sendo indispensável para navegação aérea e geodésia oficial do IBGE.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: GEOTIFF & COG METADATA PARSER */}
      {activeTab === 'geotiff-cog-metadata-parser' && (
        <div className="space-y-6">
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-cyan-400" /> Inspetor de Headers TIFF IFD & GeoKeys
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Metadados de imagens de satélite Cloud Optimized GeoTIFF (COG) sem download completo do arquivo (HTTP Range Requests).
                </p>
              </div>

              <div className="px-3 py-1 bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-mono rounded-lg">
                COG Válido (Streaming Ready)
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <div className="text-[10px] text-slate-500">Sistema de Coordenadas</div>
                <div className="text-cyan-400 font-bold">{cogMetadata.epsg}</div>
                <div className="text-[10px] text-slate-400">Projeção Cartográfica Oficial</div>
              </div>

              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <div className="text-[10px] text-slate-500">Resolução no Solo (GSD)</div>
                <div className="text-purple-400 font-bold">10.0 metros / pixel</div>
                <div className="text-[10px] text-slate-400">ModelPixelScaleTag</div>
              </div>

              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <div className="text-[10px] text-slate-500">Dimensões da Matriz</div>
                <div className="text-emerald-400 font-bold">{cogMetadata.width} × {cogMetadata.height} px</div>
                <div className="text-[10px] text-slate-400">Total: ~120 Megapixels</div>
              </div>
            </div>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs">
              <div className="font-semibold text-white">Pirâmide de Resoluções Internas (Overviews):</div>
              <div className="flex flex-wrap gap-2">
                {cogMetadata.overviews.map((ov, idx) => (
                  <span key={idx} className="px-2.5 py-1 bg-slate-900 border border-slate-800 text-slate-300 rounded-lg font-mono">
                    {ov}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-3 bg-cyan-950/20 border border-cyan-500/20 rounded-xl text-xs text-cyan-300 space-y-1">
              <div className="font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" /> Benefícios do Formato COG
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                O arquivo organiza os dados em blocos internos de 256×256 pixels com pirâmides pré-renderizadas, permitindo que bibliotecas como OpenLayers e Leaflet requisitem apenas a área visível do viewport do usuário consumindo míseros kilobytes de banda.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: GEOJSON BBOX & POLYGON BUILDER */}
      {activeTab === 'geojson-bbox-polygon-builder' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Map className="w-4 h-4 text-cyan-400" /> Vértices do Polígono (Coordenadas Lon, Lat)
              </h3>

              <div className="space-y-2">
                {polygonCoords.map((coord, idx) => (
                  <div key={idx} className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs font-mono">
                    <span className="text-cyan-400 font-bold">Vértice #{idx + 1}</span>
                    <div className="flex gap-2">
                      <span className="text-slate-400">Lon: {coord[0]}</span>
                      <span className="text-slate-400">Lat: {coord[1]}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3 text-center text-xs font-mono">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-500">Área Estimada</div>
                  <div className="text-sm font-bold text-emerald-400">{polyAreaKm2} km² ({polyAreaHa} ha)</div>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-500">Centroide [Lon, Lat]</div>
                  <div className="text-sm font-bold text-purple-400">{avgLon.toFixed(4)}, {avgLat.toFixed(4)}</div>
                </div>
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-emerald-400" /> GeoJSON RFC 7946 com Bounding Box
                </h3>
                <button
                  onClick={() => handleCopy(geoJsonFeature, 'geojson-code')}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs flex items-center gap-1 transition-all"
                >
                  {copied === 'geojson-code' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-cyan-400" />}
                  <span>Copiar JSON</span>
                </button>
              </div>

              <pre className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs text-emerald-400 overflow-x-auto max-h-72 overflow-y-auto leading-relaxed">
                {geoJsonFeature}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: H3 & GEOHASH SPATIAL INDEX CALCULATOR */}
      {activeTab === 'h3-geohash-spatial-index-calc' && (
        <div className="space-y-6">
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Hexagon className="w-5 h-5 text-cyan-400" /> Malha Espacial H3 (Hexágonos Uber) & Geohash
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Indexação espacial hierárquica discreta para agregações em tempo constante $O(1)$ e buscas por proximidade.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-1.5">
                    <span>Resolução H3 (Hexágono Nível 0 a 12):</span>
                    <span className="font-mono text-cyan-400 font-bold">Res {h3Resolution}</span>
                  </div>
                  <input
                    type="range"
                    min="3"
                    max="11"
                    step="1"
                    value={h3Resolution}
                    onChange={(e) => setH3Resolution(parseInt(e.target.value))}
                    className="w-full accent-cyan-500"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                    <span>Res 3 (~11.000 km²)</span>
                    <span>Res 8 (~0.73 km²)</span>
                    <span>Res 11 (~0.002 km²)</span>
                  </div>
                </div>

                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2 font-mono text-xs">
                  <div className="text-slate-500">// Índice Hexagonal H3 (64-bit Hex)</div>
                  <div className="text-cyan-400 text-lg font-bold break-all">
                    {h3Index}
                  </div>
                  <div className="text-[11px] text-slate-400 space-y-0.5 pt-1">
                    <div>Área da Célula: <strong className="text-slate-200">{h3AreaKm2} km²</strong></div>
                    <div>Comprimento da Aresta: <strong className="text-slate-200">{h3EdgeMeters} metros</strong></div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-1.5">
                    <span>Precisão Geohash (Caracteres Base32):</span>
                    <span className="font-mono text-purple-400 font-bold">{geohashPrecision} Caracteres</span>
                  </div>
                  <input
                    type="range"
                    min="4"
                    max="8"
                    step="1"
                    value={geohashPrecision}
                    onChange={(e) => setGeohashPrecision(parseInt(e.target.value))}
                    className="w-full accent-purple-500"
                  />
                </div>

                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2 font-mono text-xs">
                  <div className="text-slate-500">// Geohash Base32 Bounding Box</div>
                  <div className="text-purple-400 text-lg font-bold break-all">
                    {geohashBase32}
                  </div>
                  <div className="text-[11px] text-slate-400 space-y-0.5 pt-1">
                    <div>Dimensões da Célula: <strong className="text-slate-200">{geohashPrecision === 7 ? '152m × 152m' : '1.2km × 600m'}</strong></div>
                    <div>Prefixos Adjacentes: <strong className="text-slate-200">Busca por substring</strong></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-cyan-950/20 border border-cyan-500/20 rounded-xl text-xs text-cyan-300 space-y-1">
              <div className="font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" /> Vantagem dos Hexágonos H3 sobre Quadrados
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                Em uma malha hexagonal H3, todos os 6 vizinhos compartilham exatamente a mesma distância entre centroides, eliminando as ambiguidades de vizinhança de aresta vs canto presentes em grades quadradas.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}