import { Activity, ArrowUpRight, Bell, BrainCircuit, ChevronDown, CircleAlert, MapPinned, Menu, MoreHorizontal, Network, Search, ShieldCheck, TrendingUp, LogOut } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const weeklySignal = [44, 52, 48, 61, 56, 72, 69, 82, 76, 91, 84, 96];
const alerts = [
  ['Priority', 'Property crime activity elevated', 'Bengaluru Urban · 18% above baseline', 'amber'],
  ['Network', 'New association pattern detected', 'Mysuru · 6 linked case entities', 'emerald'],
  ['Review', 'Anomalous MO signature', 'Hubballi-Dharwad · 3 related incidents', 'coral'],
];

const Dashboard = () => {
  const { user, logout } = useAuthStore();

  return (
    <div className="min-h-screen bg-[#07110f] text-slate-200">
      <header className="sticky top-0 z-20 border-b border-white/8 bg-[#091713]/90 px-4 py-3 backdrop-blur-xl sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button className="grid h-9 w-9 place-items-center rounded-none border border-white/10 text-slate-300 lg:hidden">
              <Menu size={18} />
            </button>
            <span className="grid h-9 w-9 place-items-center rounded-none bg-[#c6a75b] text-[#10231d]">
              <ShieldCheck size={19} />
            </span>
            <div>
              <p className="font-display text-sm font-bold text-white">KSP Intelligence</p>
              <p className="text-[10px] font-semibold uppercase tracking-[.16em] text-emerald-100/45">Command centre</p>
            </div>
          </div>
          <div className="hidden max-w-md flex-1 items-center gap-2 rounded-none border border-white/8 bg-white/[0.035] px-3 py-2 text-sm text-slate-500 md:flex">
            <Search size={16} />
            <span>Search cases, persons, locations…</span>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative grid h-9 w-9 place-items-center rounded-none border border-white/10 text-slate-300">
              <Bell size={17} />
              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[#e5b956]" />
            </button>
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
            <Nav label="Overview" icon={Activity} active />
            <Nav label="Geospatial" icon={MapPinned} />
            <Nav label="Network analysis" icon={Network} />
            <Nav label="Predictions" icon={BrainCircuit} />
            <Nav label="Case ledger" icon={Search} />
          </nav>
          <div className="mt-8 rounded-none border border-[#c6a75b]/15 bg-[#c6a75b]/[.06] p-4">
            <p className="text-xs font-semibold text-[#e2c979]">Intelligence status</p>
            <p className="mt-2 text-xs leading-5 text-slate-400">All monitored feeds operating within parameters.</p>
            <div className="mt-4 flex items-center gap-2 text-[11px] font-bold text-emerald-200">
              <span className="h-2 w-2 rounded-full bg-emerald-300" /> SYSTEMS OPERATIONAL
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.18em] text-[#d8bb70]">Operational overview</p>
              <h1 className="font-display mt-2 text-2xl font-semibold tracking-[-.035em] text-white sm:text-3xl">
                Good morning, {user?.email?.split('@')[0] || 'Analyst'}.
              </h1>
              <p className="mt-2 text-sm text-slate-400">A focused view of current signals across Karnataka.</p>
            </div>
            <button className="inline-flex items-center gap-2 self-start rounded-none border border-white/10 bg-white/[.035] px-3 py-2 text-xs font-semibold text-slate-300 sm:self-auto">
              Last 30 days <ChevronDown size={14} />
            </button>
          </div>

          <section className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Stat label="Cases logged" value="18,642" change="+8.4%" icon={Activity} />
            <Stat label="Active alerts" value="08" change="2 new" icon={CircleAlert} tone="amber" />
            <Stat label="Network entities" value="4,891" change="+216 this week" icon={Network} />
            <Stat label="High-risk zones" value="14" change="Review required" icon={MapPinned} tone="coral" />
          </section>

          <section className="mt-5 grid gap-5 xl:grid-cols-[1.35fr_.85fr]">
            <div className="rounded-none border border-white/8 bg-[#0c211b] p-5 sm:p-6">
              <PanelHeading title="Crime activity signal" subtitle="Weekly incidents against historical baseline" />
              <div className="mt-8 flex h-48 items-end gap-2 sm:gap-3">
                {weeklySignal.map((height, index) => (
                  <div key={index} className="group relative flex h-full flex-1 items-end">
                    <div
                      style={{ height: `${height}%` }}
                      className={`w-full rounded-none transition group-hover:opacity-85 ${index > 9 ? 'bg-[#d9ba69]' : 'bg-emerald-300/50'}`}
                    />
                    <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[9px] text-slate-600">
                      {index % 2 === 0 ? `W${index + 1}` : ''}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-10 flex items-center gap-5 text-[11px] text-slate-400">
                <span className="flex items-center gap-2"><i className="h-2 w-2 rounded-full bg-emerald-300/50" /> Observed activity</span>
                <span className="flex items-center gap-2"><i className="h-2 w-2 rounded-full bg-[#d9ba69]" /> Attention threshold</span>
              </div>
            </div>

            <div className="rounded-none border border-white/8 bg-[#0c211b] p-5 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-display text-base font-semibold text-white">Priority signals</p>
                  <p className="mt-1 text-xs text-slate-500">Ranked for analyst review</p>
                </div>
                <span className="rounded-full bg-[#e7ba5c]/10 px-2.5 py-1 text-[10px] font-bold text-[#e7ba5c]">08 ACTIVE</span>
              </div>
              <div className="mt-4 divide-y divide-white/7">
                {alerts.map(([type, title, detail, tone]) => (
                  <div key={title} className="flex gap-3 py-4 first:pt-2">
                    <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${tone === 'amber' ? 'bg-[#e7ba5c]' : tone === 'coral' ? 'bg-[#ef7763]' : 'bg-emerald-300'}`} />
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{type}</p>
                      <p className="mt-1 text-sm font-semibold text-slate-200">{title}</p>
                      <p className="mt-1 text-xs text-slate-500">{detail}</p>
                    </div>
                    <ArrowUpRight className="ml-auto shrink-0 text-slate-600" size={16} />
                  </div>
                ))}
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

const Nav = ({ label, icon: Icon, active = false }: { label: string; icon: typeof Activity; active?: boolean }) => (
  <button className={`flex w-full items-center gap-3 rounded-none px-3 py-2.5 text-sm transition ${active ? 'bg-emerald-200/10 font-semibold text-emerald-100' : 'text-slate-400 hover:bg-white/[.04] hover:text-white'}`}>
    <Icon size={17} />
    {label}
  </button>
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
