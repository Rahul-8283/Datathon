import { useEffect, useState } from 'react';
import { Activity, BrainCircuit, ChevronDown, CircleAlert, MapPinned, Menu, MoreHorizontal, Network, Search, ShieldCheck, TrendingUp, LogOut, FileSearch, Loader2, Wifi, WifiOff, Radio } from 'lucide-react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import CaseLedger from './CaseLedger';
import SemanticSearch from './SemanticSearch';
import NetworkAnalysis from './NetworkAnalysis';
import GeospatialAnalytics from './GeospatialAnalytics';
import { getOverviewStats, type OverviewStats } from '../services/api';

// Fallback arrays for charts/alerts
const fallbackWeeklySignal = [44, 52, 48, 61, 56, 72, 69, 82, 76, 91, 84, 96];
const initialAlerts = [
  ['Priority', 'Property crime activity elevated', 'Bengaluru Urban · 18% above baseline', 'amber'],
  ['Network', 'New association pattern detected', 'Mysuru · 6 linked case entities', 'emerald'],
  ['Review', 'Anomalous MO signature', 'Hubballi-Dharwad · 3 related incidents', 'coral'],
];

const Dashboard = () => {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const currentPath = location.pathname;

  const [wsConnected, setWsConnected] = useState<boolean>(false);
  const [liveStreamAlert, setLiveStreamAlert] = useState<string | null>(null);

  useEffect(() => {
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = import.meta.env.VITE_WS_URL || `${wsProtocol}//127.0.0.1:8000/ws/alerts`;

    let socket: WebSocket | null = null;
    try {
      socket = new WebSocket(wsUrl);
      socket.onopen = () => {
        setWsConnected(true);
      };
      socket.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.message) {
            setLiveStreamAlert(payload.message);
          }
        } catch (e) {
          console.error('WS message error:', e);
        }
      };
      socket.onclose = () => setWsConnected(false);
      socket.onerror = () => setWsConnected(false);
    } catch (err) {
      console.error('WebSocket connection error:', err);
    }

    return () => {
      socket?.close();
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#07110f] text-slate-200">
      {/* Real-time Incident Ticker Bar (Phase 9) */}
      <div className="bg-[#050c0a] border-b border-white/10 px-4 py-2 text-xs font-mono flex items-center justify-between">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex items-center gap-1.5 shrink-0 text-emerald-400 font-bold uppercase tracking-wider">
            <Radio size={14} className="animate-pulse text-[#c6a75b]" />
            <span>KSP Operational Stream:</span>
          </div>
          <p className="truncate text-slate-300">
            {liveStreamAlert || 'Monitoring statewide crime diaries, entity relationships, and spatiotemporal spikes.'}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0 border-l border-white/10 pl-3">
          {wsConnected ? (
            <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400">
              <Wifi size={12} /> WEBSOCKET LIVE
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500">
              <WifiOff size={12} /> STREAM STANDBY
            </span>
          )}
        </div>
      </div>

      <header className="sticky top-0 z-20 bg-[#07110f]/90 px-4 py-3 sm:px-6 lg:px-8 backdrop-blur-xl border-b border-white/10">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button className="grid h-9 w-9 place-items-center rounded-none border border-white/10 text-slate-300 lg:hidden">
              <Menu size={18} />
            </button>
            <div className="flex items-baseline gap-2">
              <p className="font-display text-lg font-bold text-white">KSP Intelligence</p>
              <p className="text-xs font-semibold uppercase tracking-[.16em] text-emerald-100/45">Command centre</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden border-l border-white/10 pl-4 sm:block">
              <p className="text-xs font-semibold text-white">{user?.email || 'Officer Session'}</p>
              <p className="text-[10px] text-slate-500 font-mono">Karnataka · Authenticated</p>
            </div>
            <button
              onClick={logout}
              title="Log Out"
              className="flex items-center gap-1.5 rounded-none border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-400 hover:bg-red-500/20 transition-all cursor-pointer"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1600px] gap-7 px-4 py-6 sm:px-6 lg:px-8">
        <aside className="hidden w-56 shrink-0 lg:block">
          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[.18em] text-slate-500">Workspace</p>
          <nav className="space-y-1">
            <Nav label="Overview" icon={Activity} to="/dashboard" active={currentPath === '/dashboard' || currentPath === '/dashboard/'} />
            <Nav label="Geospatial" icon={MapPinned} to="/dashboard/geospatial" active={currentPath === '/dashboard/geospatial'} />
            <Nav label="Network analysis" icon={Network} to="/dashboard/network" active={currentPath === '/dashboard/network'} />
            <Nav label="Predictions" icon={BrainCircuit} to="/dashboard/predictions" active={currentPath === '/dashboard/predictions'} />
            <Nav label="Semantic Search" icon={FileSearch} to="/dashboard/search" active={currentPath === '/dashboard/search'} />
            <Nav label="Case ledger" icon={Search} to="/dashboard/cases" active={currentPath === '/dashboard/cases'} />
          </nav>
          <div className="mt-8 rounded-none border border-[#c6a75b]/15 bg-[#c6a75b]/[.06] p-4">
            <p className="text-xs font-semibold text-[#e2c979]">Intelligence status</p>
            <p className="mt-2 text-xs leading-5 text-slate-400">All monitored feeds operating within parameters.</p>
            <div className="mt-4 flex items-center gap-2 text-[11px] font-bold text-emerald-200 font-mono">
              <span className="h-2 w-2 rounded-full bg-emerald-300 animate-pulse" /> SYSTEMS OPERATIONAL
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <Routes>
            <Route path="/" element={<OverviewTab />} />
            <Route path="/geospatial" element={<GeospatialAnalytics />} />
            <Route path="/network" element={<NetworkAnalysis />} />
            <Route path="/predictions" element={<PlaceholderTab title="AI Predictive Forecasting" />} />
            <Route path="/search" element={<SemanticSearch />} />
            <Route path="/cases" element={<CaseLedger />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

const OverviewTab = () => {
  const [stats, setStats] = useState<OverviewStats | null>(null);

  useEffect(() => {
    getOverviewStats().then(setStats).catch(console.error);
  }, []);

  if (!stats) {
    return (
      <div className="flex h-full min-h-[400px] items-center justify-center">
        <Loader2 className="animate-spin text-[#d8bb70]" size={42} />
      </div>
    );
  }

  const weeklySignal = stats.weekly_signal || fallbackWeeklySignal;

  return (
    <>
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold text-emerald-200/80">Command Overview</p>
          <h1 className="font-display mt-1 text-2xl font-semibold text-white sm:text-3xl">Strategic Crime Intelligence</h1>
          <p className="mt-2 text-xs text-slate-400">
            Multi-agent ETL extraction, graph network analysis, and AI predictive forecasting engine.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded-none border border-[#e2c979]/20 bg-[#e2c979]/10 px-3 py-1.5 text-xs font-bold text-[#e2c979] font-mono">
            LIVE SYSTEM
          </span>
          <button className="flex items-center gap-2 rounded-none border border-white/12 bg-white/[.04] px-4 py-2 text-xs font-semibold text-white">
            <span>Export Briefing</span>
            <ChevronDown size={15} />
          </button>
        </div>
      </div>

      <section className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Cases Logged" value={stats.cases_logged.toLocaleString()} change="Active Database FIRs" icon={Search} tone="green" />
        <Stat label="Network Entities" value={stats.network_entities.toLocaleString()} change="Neo4j Aura Nodes" icon={Network} tone="amber" />
        <Stat label="Active Alerts" value={stats.active_alerts.toString()} change="High Priority Signals" icon={CircleAlert} tone="coral" />
        <Stat label="High Risk Zones" value={stats.high_risk_zones.toString()} change="Geospatial Hotspots" icon={MapPinned} tone="amber" />
      </section>

      <div className="mt-7 grid gap-6 lg:grid-cols-3">
        <section className="rounded-none border border-white/8 bg-[#0c211b] p-6 lg:col-span-2">
          <PanelHeading title="Statewide Crime Activity Index" subtitle="12-week aggregate trend analysis across monitored districts" />
          <div className="mt-7 flex h-48 items-end gap-2 border-b border-white/10 pb-4">
            {weeklySignal.map((v, i) => (
              <div key={i} className="flex-1 space-y-2 text-center">
                <div
                  className="mx-auto w-full max-w-[28px] rounded-none bg-gradient-to-t from-emerald-900 via-emerald-600 to-[#d8bb70] transition-all hover:brightness-125"
                  style={{ height: `${v * 1.6}px` }}
                />
                <span className="block text-[10px] text-slate-500 font-mono">W{i + 1}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-none border border-white/8 bg-[#0c211b] p-6">
          <PanelHeading title="Intelligence Feed" subtitle="Real-time priority signals" />
          <div className="mt-6 space-y-4 font-mono">
            {initialAlerts.map(([tag, title, sub], i) => (
              <div key={i} className="border-l-2 border-[#d8bb70] bg-[#07110f] p-3 pl-4">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-[#e2c979] uppercase">{tag}</span>
                  <span className="text-slate-500">Just now</span>
                </div>
                <p className="mt-1 text-xs font-semibold text-white font-sans">{title}</p>
                <p className="mt-0.5 text-[11px] text-slate-400">{sub}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
};

const PlaceholderTab = ({ title }: { title: string }) => (
  <div className="rounded-none border border-white/8 bg-[#0c211b] p-12 text-center space-y-4">
    <ShieldCheck className="mx-auto text-[#e2c979] animate-pulse" size={42} />
    <h2 className="font-display text-base font-bold text-white uppercase tracking-widest">{title}</h2>
    <p className="text-slate-400 text-sm max-w-md mx-auto leading-relaxed">
      This operational module is fully configured on backend REST & GraphQL services and ready for presentation integration.
    </p>
  </div>
);

const Nav = ({ label, icon: Icon, to, active = false }: { label: string; icon: typeof Activity; to: string; active?: boolean }) => (
  <Link
    to={to}
    className={`flex w-full items-center gap-3 rounded-none px-3 py-2.5 text-sm transition ${active ? 'bg-emerald-200/10 font-semibold text-emerald-100' : 'text-slate-400 hover:bg-white/[.04] hover:text-white'}`}
  >
    <Icon size={17} />
    {label}
  </Link>
);

const PanelHeading = ({ title, subtitle }: { title: string; subtitle: string }) => (
  <div className="flex items-start justify-between">
    <div>
      <p className="font-display text-base font-semibold text-white">{title}</p>
      <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
    </div>
    <MoreHorizontal size={19} className="text-slate-600" />
  </div>
);

const Stat = ({ label, value, change, icon: Icon, tone = 'green' }: { label: string; value: string; change: string; icon: typeof Activity; tone?: 'green' | 'amber' | 'coral' }) => {
  const colors = tone === 'amber' ? 'bg-[#e7ba5c]/12 text-[#e7ba5c]' : tone === 'coral' ? 'bg-[#ef7763]/12 text-[#ef7763]' : 'bg-emerald-300/10 text-emerald-200';
  const text = tone === 'green' ? 'text-emerald-200' : tone === 'amber' ? 'text-[#e7ba5c]' : 'text-[#ef7763]';
  return (
    <article className="rounded-none border border-white/8 bg-[#0c211b] p-5">
      <div className="flex items-start justify-between">
        <span className={`grid h-9 w-9 place-items-center rounded-none ${colors}`}><Icon size={18} /></span>
        <TrendingUp size={15} className="text-slate-600" />
      </div>
      <p className="mt-5 text-xs text-slate-400">{label}</p>
      <p className="font-display mt-1 text-2xl font-semibold text-white">{value}</p>
      <p className={`mt-2 text-[11px] font-semibold ${text}`}>{change}</p>
    </article>
  );
};

export default Dashboard;
