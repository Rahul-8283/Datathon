import React, { useEffect, useState } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { AlertTriangle, Sparkles, Loader2, RefreshCw, AlertCircle, CheckCircle2, Cpu } from 'lucide-react';
import { getDistrictForecast, getFlaggedAnomalies, runAnomalyDetection, type ForecastPoint, type CaseResponse } from '../services/api';

const DISTRICT_LIST = [
  'Bengaluru Urban',
  'Mysuru',
  'Hubballi-Dharwad',
  'Mangaluru (Dakshina Kannada)',
  'Belagavi',
  'Kalaburagi',
  'Shivamogga',
  'Tumakuru',
];

export const PredictiveForecasting: React.FC = () => {
  const [selectedDistrict, setSelectedDistrict] = useState<string>('Bengaluru Urban');
  const [forecastData, setForecastData] = useState<ForecastPoint[]>([]);
  const [anomalies, setAnomalies] = useState<CaseResponse[]>([]);
  const [loadingForecast, setLoadingForecast] = useState<boolean>(true);
  const [loadingAnomalies, setLoadingAnomalies] = useState<boolean>(true);
  const [runningAnalysis, setRunningAnalysis] = useState<boolean>(false);
  const [analysisStatus, setAnalysisStatus] = useState<string | null>(null);

  useEffect(() => {
    fetchForecast(selectedDistrict);
  }, [selectedDistrict]);

  useEffect(() => {
    fetchAnomalies();
  }, []);

  const fetchForecast = async (district: string) => {
    setLoadingForecast(true);
    try {
      const data = await getDistrictForecast(district);
      setForecastData(data);
    } catch (err) {
      console.error('Failed to load forecast data:', err);
    } finally {
      setLoadingForecast(false);
    }
  };

  const fetchAnomalies = async () => {
    setLoadingAnomalies(true);
    try {
      const data = await getFlaggedAnomalies();
      setAnomalies(data);
    } catch (err) {
      console.error('Failed to load anomalies:', err);
    } finally {
      setLoadingAnomalies(false);
    }
  };

  const handleRunAnalysis = async () => {
    setRunningAnalysis(true);
    setAnalysisStatus(null);
    try {
      const updatedAnomalies = await runAnomalyDetection();
      setAnomalies(updatedAnomalies);
      setAnalysisStatus(`Isolation Forest scoring pipeline completed. Flagged ${updatedAnomalies.length} anomalous case records.`);
    } catch (err: any) {
      console.error('Failed to run anomaly analysis:', err);
      setAnalysisStatus('Pipeline execution error. Please ensure sufficient case data is logged.');
    } finally {
      setRunningAnalysis(false);
    }
  };

  // Compute forecast stats
  const avgPredictedVolume = forecastData.length > 0
    ? (forecastData.reduce((acc, curr) => acc + curr.yhat, 0) / forecastData.length).toFixed(1)
    : '0.0';

  const maxPeakPoint = forecastData.length > 0
    ? forecastData.reduce((max, curr) => curr.yhat > max.yhat ? curr : max, forecastData[0])
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 rounded-none border border-emerald-200/15 bg-emerald-300/[0.06] px-3 py-1 text-xs font-semibold text-emerald-100/80 mb-2">
            <Sparkles size={13} className="text-[#d8bb70]" />
            Machine Learning Predictive Engine
          </div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
            AI Case Volume Forecasting & Outlier Detection
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            30-Day Prophet time-series crime projections and PyTorch/scikit-learn Isolation Forest behavioral anomaly detection.
          </p>
        </div>

        {/* District Selector Dropdown */}
        <div className="flex items-center gap-2 bg-[#102a23] border border-white/10 p-2 rounded-none">
          <Cpu size={16} className="text-[#c6a75b]" />
          <span className="text-xs font-mono font-bold uppercase text-slate-400">Jurisdiction:</span>
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="bg-[#07110f] border border-white/12 text-xs font-mono text-white py-1.5 px-3 rounded-none focus:outline-none focus:border-[#c6a75b] cursor-pointer"
          >
            {DISTRICT_LIST.map((dist) => (
              <option key={dist} value={dist}>
                {dist}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid: 30-Day Prophet Forecast Chart */}
      <div className="bg-[#0c211b]/95 border border-white/10 rounded-none p-5 backdrop-blur-xl relative space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/10 pb-3 gap-2">
          <div>
            <p className="text-[10px] font-mono font-bold uppercase tracking-[.18em] text-slate-500">Prophet Time-Series Engine</p>
            <h2 className="font-display text-xl font-bold text-white mt-0.5">
              30-Day Projected Volume · {selectedDistrict}
            </h2>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-1.5 text-slate-300">
              <span className="w-3 h-0.5 bg-[#c6a75b] inline-block" />
              <span>Predicted Expected (`yhat`)</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-400">
              <span className="w-3 h-3 bg-emerald-500/20 border border-emerald-500/40 inline-block" />
              <span>Confidence Interval</span>
            </div>
          </div>
        </div>

        {/* Forecast Quick Summary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[#07110f] border border-white/10 p-3.5 rounded-none font-mono">
            <p className="text-[10px] text-slate-500 uppercase">30-Day Avg Daily Volume</p>
            <p className="text-2xl font-bold text-white mt-1">{avgPredictedVolume} <span className="text-xs text-slate-400">cases/day</span></p>
          </div>
          <div className="bg-[#07110f] border border-white/10 p-3.5 rounded-none font-mono">
            <p className="text-[10px] text-slate-500 uppercase">Projected Peak Date</p>
            <p className="text-2xl font-bold text-[#c6a75b] mt-1">{maxPeakPoint ? maxPeakPoint.ds : 'N/A'}</p>
          </div>
          <div className="bg-[#07110f] border border-white/10 p-3.5 rounded-none font-mono">
            <p className="text-[10px] text-slate-500 uppercase">Model Status</p>
            <p className="text-sm font-bold text-emerald-400 mt-2 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              PROPHET FIT OPERATIONAL
            </p>
          </div>
        </div>

        {/* Chart Box */}
        <div className="h-[340px] w-full pt-4">
          {loadingForecast ? (
            <div className="h-full w-full bg-[#07110f] flex flex-col items-center justify-center gap-3 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-[#c6a75b]" />
              <span className="text-xs font-mono uppercase tracking-widest">Training Prophet Time-Series Model...</span>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={forecastData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorYhat" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#c6a75b" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#c6a75b" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorUpper" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.07)" />
                <XAxis dataKey="ds" stroke="#64748b" tick={{ fontSize: 10, fontFamily: 'monospace' }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 10, fontFamily: 'monospace' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0c211b',
                    borderColor: 'rgba(255,255,255,0.15)',
                    borderRadius: '0px',
                    color: '#f8fafc',
                    fontFamily: 'monospace',
                    fontSize: '12px',
                  }}
                />
                <Area type="monotone" dataKey="yhat_upper" name="Upper Bound" stroke="#10b981" fillOpacity={1} fill="url(#colorUpper)" />
                <Area type="monotone" dataKey="yhat" name="Expected Forecast" stroke="#c6a75b" strokeWidth={2} fillOpacity={1} fill="url(#colorYhat)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Section 2: Isolation Forest Anomaly Detection */}
      <div className="bg-[#0c211b]/95 border border-white/10 rounded-none p-5 backdrop-blur-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/10 pb-3 gap-3">
          <div>
            <div className="flex items-center gap-2">
              <AlertTriangle className="text-red-400" size={18} />
              <h3 className="font-display text-xl font-bold text-white">
                Isolation Forest Anomaly Outliers
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Evaluates multi-dimensional crime features (time of day, description length, jurisdiction variance) to isolate anomalous FIR incidents.
            </p>
          </div>

          <button
            onClick={handleRunAnalysis}
            disabled={runningAnalysis}
            className="px-4 py-2 bg-[#c6a75b] hover:bg-[#e0c477] text-[#10231d] font-bold text-xs uppercase font-mono tracking-wider rounded-none transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer shrink-0"
          >
            {runningAnalysis ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Fitting Model...</span>
              </>
            ) : (
              <>
                <RefreshCw size={14} />
                <span>Re-Run Anomaly Pipeline</span>
              </>
            )}
          </button>
        </div>

        {analysisStatus && (
          <div className="p-3 bg-emerald-950/70 border border-emerald-500/30 rounded-none flex items-center gap-2 text-emerald-200 text-xs font-mono">
            <CheckCircle2 size={15} className="text-emerald-400" />
            <span>{analysisStatus}</span>
          </div>
        )}

        {/* Flagged Anomalies Table */}
        <div className="border border-white/10 bg-[#07110f] overflow-x-auto">
          {loadingAnomalies ? (
            <div className="p-8 text-center text-slate-400 text-xs font-mono">Loading anomaly database flags...</div>
          ) : anomalies.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs font-mono">
              No cases currently flagged as statistical anomalies. Click <strong>"Re-Run Anomaly Pipeline"</strong> to execute scoring.
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs font-mono">
              <thead>
                <tr className="border-b border-white/10 bg-[#102a23] text-[10px] uppercase tracking-wider text-slate-400">
                  <th className="p-3">FIR Number</th>
                  <th className="p-3">Jurisdiction</th>
                  <th className="p-3">Reported Timestamp</th>
                  <th className="p-3">Crime Category</th>
                  <th className="p-3">Anomaly Classification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                {anomalies.map((c) => (
                  <tr key={c.id} className="hover:bg-white/[0.03] transition">
                    <td className="p-3 font-bold text-white">{c.fir_number}</td>
                    <td className="p-3">{c.district}</td>
                    <td className="p-3 text-slate-400">{new Date(c.date_reported).toLocaleString()}</td>
                    <td className="p-3 text-[#c6a75b]">{c.status}</td>
                    <td className="p-3">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-red-950 border border-red-500/30 text-red-300 text-[10px] font-bold uppercase">
                        <AlertCircle size={12} className="text-red-400" />
                        STATISTICAL ANOMALY
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default PredictiveForecasting;
