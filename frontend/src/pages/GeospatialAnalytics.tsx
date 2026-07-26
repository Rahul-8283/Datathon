import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPinned, AlertTriangle, Loader2, Sparkles, ChevronRight } from 'lucide-react';
import { getDistrictGeospatial, getSpatiotemporalHotspots, type DistrictGeospatial, type Hotspot } from '../services/api';

// Custom dark map tile URL (CartoDB Dark Matter)
const CARTO_DARK_TILES = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
const CARTO_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

// Default Karnataka center coordinates
const KARNATAKA_CENTER: [number, number] = [13.9299, 75.8681];

// Custom SVG Icons for District Risk Markers
const createRiskIcon = (color: string, label: string) => {
  return L.divIcon({
    className: 'custom-div-icon',
    html: `
      <div style="
        background-color: ${color};
        color: #07110f;
        font-weight: 800;
        font-size: 10px;
        padding: 4px 8px;
        border-radius: 0px;
        border: 1.5px solid rgba(255,255,255,0.8);
        box-shadow: 0 0 12px ${color}aa;
        font-family: monospace;
        white-space: nowrap;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      ">
        ${label}
      </div>
    `,
    iconSize: [80, 24],
    iconAnchor: [40, 12],
  });
};

export const GeospatialAnalytics: React.FC = () => {
  const [districts, setDistricts] = useState<DistrictGeospatial[]>([]);
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState<DistrictGeospatial | null>(null);
  const [timeWindow, setTimeWindow] = useState<'ALL' | 'NIGHT' | 'MORNING' | 'AFTERNOON' | 'EVENING'>('ALL');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchHotspots(timeWindow);
  }, [timeWindow]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const distData = await getDistrictGeospatial();
      setDistricts(distData);
      if (distData.length > 0) {
        setSelectedDistrict(distData[0]);
      }
      await fetchHotspots(timeWindow);
    } catch (err: any) {
      console.error('Failed to load geospatial analytics:', err);
      setError('Unable to retrieve geospatial district feeds from intelligence server.');
    } finally {
      setLoading(false);
    }
  };

  const fetchHotspots = async (window: string) => {
    try {
      const hotspotData = await getSpatiotemporalHotspots(window);
      setHotspots(hotspotData);
    } catch (err) {
      console.error('Failed to load spatiotemporal hotspots:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 rounded-none border border-emerald-200/15 bg-emerald-300/[0.06] px-3 py-1 text-xs font-semibold text-emerald-100/80 mb-2">
            <Sparkles size={13} className="text-[#d8bb70]" />
            Geospatial & Spatiotemporal Engine
          </div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Statewide Hotspot & Risk Choropleth
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time GIS district risk mapping, spatiotemporal cluster analysis, and temporal crime shift tracking across Karnataka.
          </p>
        </div>

        {/* Time Window Filter Tabs */}
        <div className="flex items-center gap-1 bg-[#102a23] border border-white/10 rounded-none p-1 text-xs font-bold font-mono">
          {(['ALL', 'NIGHT', 'MORNING', 'AFTERNOON', 'EVENING'] as const).map((w) => (
            <button
              key={w}
              onClick={() => setTimeWindow(w)}
              className={`px-3 py-1.5 transition cursor-pointer uppercase ${
                timeWindow === w
                  ? 'bg-[#c6a75b] text-[#10231d] font-bold shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {w === 'ALL' ? '24h All' : w}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-950/70 border border-red-500/30 rounded-none text-red-200 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span>{error}</span>
          </div>
          <button
            onClick={fetchData}
            className="px-3 py-1 bg-red-900 hover:bg-red-800 text-white rounded-none text-xs uppercase font-bold"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Main Grid: Interactive Map + District Inspector Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Leaflet Map (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-[#0c211b]/95 border border-white/10 rounded-none p-2 backdrop-blur-xl relative overflow-hidden shadow-2xl">
            {/* Map Header Status Ticker */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-white/10 bg-[#07110f] mb-2 text-xs font-mono">
              <div className="flex items-center gap-2 text-slate-300">
                <MapPinned size={15} className="text-[#c6a75b]" />
                <span className="font-bold text-white uppercase tracking-wider">Karnataka GIS Grid</span>
                <span className="text-slate-500">|</span>
                <span className="text-slate-400">Active Hotspots: {hotspots.length}</span>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-300">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                LIVE SPATIOTEMPORAL FEED
              </div>
            </div>

            {/* Leaflet Map Box */}
            <div className="h-[520px] w-full relative z-10 border border-white/10">
              {loading ? (
                <div className="h-full w-full bg-[#07110f] flex flex-col items-center justify-center gap-3 text-slate-400">
                  <Loader2 className="w-8 h-8 animate-spin text-[#c6a75b]" />
                  <span className="text-xs font-mono uppercase tracking-widest">Initializing Leaflet Tile Engine...</span>
                </div>
              ) : (
                <MapContainer
                  center={KARNATAKA_CENTER}
                  zoom={7}
                  scrollWheelZoom={true}
                  className="h-full w-full z-0 bg-[#07110f]"
                >
                  <TileLayer attribution={CARTO_ATTRIBUTION} url={CARTO_DARK_TILES} />

                  {/* District Risk Markers */}
                  {districts.map((d) => (
                    <Marker
                      key={d.code}
                      position={[d.lat, d.lng]}
                      icon={createRiskIcon(d.color, `${d.district.split(' ')[0]}: ${d.risk_level}`)}
                      eventHandlers={{
                        click: () => setSelectedDistrict(d),
                      }}
                    >
                      <Popup className="custom-popup">
                        <div className="p-2 bg-[#0c211b] text-slate-200 text-xs font-sans space-y-1">
                          <p className="font-bold text-[#c6a75b] uppercase font-mono">{d.district}</p>
                          <p className="text-[11px]">Logged Cases: <strong className="text-white">{d.total_cases}</strong></p>
                          <p className="text-[11px]">Flagged Anomalies: <strong className="text-red-400">{d.anomalies}</strong></p>
                          <p className="text-[11px]">Top Category: <span className="text-slate-300">{d.top_crime_type}</span></p>
                        </div>
                      </Popup>
                    </Marker>
                  ))}

                  {/* Spatiotemporal Hotspot Heat Circles */}
                  {hotspots.map((h) => (
                    <CircleMarker
                      key={h.id}
                      center={[h.lat, h.lng]}
                      radius={h.is_anomaly ? 10 : 6}
                      pathOptions={{
                        color: h.is_anomaly ? '#ef4444' : '#f97316',
                        fillColor: h.is_anomaly ? '#ef4444' : '#f97316',
                        fillOpacity: h.is_anomaly ? 0.8 : 0.4,
                        weight: h.is_anomaly ? 2 : 1,
                      }}
                    >
                      <Popup>
                        <div className="p-2 text-xs font-mono space-y-1">
                          <p className="font-bold text-[#c6a75b]">FIR #{h.fir_number}</p>
                          <p>Type: {h.crime_type}</p>
                          <p>Hour Reported: {h.hour}:00 hrs</p>
                          {h.is_anomaly && <p className="text-red-400 font-bold">⚠️ STATISTICAL ANOMALY</p>}
                        </div>
                      </Popup>
                    </CircleMarker>
                  ))}
                </MapContainer>
              )}
            </div>

            {/* Map Legend Bar */}
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 px-3 py-2 bg-[#07110f] border border-white/10 text-[11px] font-mono text-slate-400">
              <div className="flex items-center gap-4">
                <span className="font-bold text-white uppercase">Risk Levels:</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-red-500 rounded-none inline-block" /> Critical</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-orange-500 rounded-none inline-block" /> High</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-yellow-500 rounded-none inline-block" /> Elevated</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-emerald-500 rounded-none inline-block" /> Moderate</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 border border-red-500 bg-red-500/30 inline-block animate-ping" />
                <span>Pulsing Circle = Anomaly Cluster</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: District Inspector & Intelligence Cards */}
        <div className="space-y-4">
          
          {/* Selected District Inspector Card */}
          <div className="bg-[#0c211b]/95 border border-white/10 rounded-none p-5 backdrop-blur-xl relative space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <p className="text-[10px] font-mono font-bold uppercase tracking-[.18em] text-slate-500">Jurisdiction Inspector</p>
                <h3 className="font-display text-xl font-bold text-white mt-0.5">
                  {selectedDistrict ? selectedDistrict.district : 'Select District'}
                </h3>
              </div>
              {selectedDistrict && (
                <span
                  className="px-2.5 py-1 text-xs font-bold font-mono rounded-none uppercase tracking-wider text-[#07110f]"
                  style={{ backgroundColor: selectedDistrict.color }}
                >
                  {selectedDistrict.risk_level}
                </span>
              )}
            </div>

            {selectedDistrict ? (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#102a23] border border-white/10 p-3 rounded-none">
                    <p className="text-[10px] text-slate-400 font-mono uppercase">Logged Cases</p>
                    <p className="text-xl font-bold text-white font-mono mt-1">{selectedDistrict.total_cases}</p>
                  </div>
                  <div className="bg-[#102a23] border border-white/10 p-3 rounded-none">
                    <p className="text-[10px] text-slate-400 font-mono uppercase">Flagged Anomalies</p>
                    <p className="text-xl font-bold text-red-400 font-mono mt-1">{selectedDistrict.anomalies}</p>
                  </div>
                </div>

                <div className="space-y-2 bg-[#07110f] border border-white/10 p-3.5 rounded-none font-mono">
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-500">District Code:</span>
                    <span className="font-bold text-white">{selectedDistrict.code}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-500">Coordinates:</span>
                    <span>{selectedDistrict.lat.toFixed(4)}, {selectedDistrict.lng.toFixed(4)}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-500">Trend Shift:</span>
                    <span className={selectedDistrict.crime_rate_change.startsWith('+') ? 'text-red-400 font-bold' : 'text-emerald-400 font-bold'}>
                      {selectedDistrict.crime_rate_change} vs 3-Yr Avg
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-500">Primary Vector:</span>
                    <span className="text-[#c6a75b] font-semibold">{selectedDistrict.top_crime_type}</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">Select any district marker on the map to inspect metrics.</p>
            )}
          </div>

          {/* District Risk Directory List */}
          <div className="bg-[#0c211b]/95 border border-white/10 rounded-none p-5 backdrop-blur-xl space-y-3">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">District Risk Directory</span>
              <span className="text-[10px] text-slate-500 font-mono">{districts.length} Regions Monitored</span>
            </div>

            <div className="max-h-[220px] overflow-y-auto space-y-1.5 pr-1 font-mono">
              {districts.map((d) => (
                <button
                  key={d.code}
                  onClick={() => setSelectedDistrict(d)}
                  className={`w-full text-left p-2.5 border transition flex items-center justify-between cursor-pointer ${
                    selectedDistrict?.code === d.code
                      ? 'bg-[#102a23] border-[#c6a75b] text-white'
                      : 'bg-[#07110f]/50 border-white/5 text-slate-400 hover:border-white/20 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-none" style={{ backgroundColor: d.color }} />
                    <span className="text-xs font-semibold">{d.district}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px]">
                    <span className="text-slate-500">{d.total_cases} cases</span>
                    <ChevronRight size={14} className="text-slate-500" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeospatialAnalytics;
