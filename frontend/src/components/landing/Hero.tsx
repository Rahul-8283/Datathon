import { ArrowRight, ChevronDown, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

const Hero = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* Sticky Full-Width Navbar */}
      <nav className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-[#07110f]/90 backdrop-blur-xl border-b border-white/10' : 'bg-transparent border-b border-transparent'}`}>
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 pt-6 pb-4 sm:px-5">
          <Link to="/" className="flex items-center gap-3">
            <span className="font-display block text-xl font-bold tracking-tight text-white">KSP Intelligence</span>
          </Link>
          <div className="hidden items-center gap-8 text-base text-slate-300 lg:flex">
            <a href="#capabilities" className="transition hover:text-white">Capabilities</a>
            <a href="#workflow" className="transition hover:text-white">Workflow</a>
            <a href="#mission" className="transition hover:text-white">Mission</a>
          </div>
          <Link to="/dashboard" className="inline-flex items-center gap-2 text-base font-bold text-[#c6a75b] transition hover:text-[#e0c477]">
            Enter dashboard <ArrowRight size={18} />
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative isolate overflow-hidden px-5 pb-24 pt-24 sm:px-8 lg:px-12">
        <div className="absolute inset-x-0 top-0 -z-10 h-[680px] bg-[radial-gradient(circle_at_72%_18%,rgba(40,137,113,0.25),transparent_27%),radial-gradient(circle_at_15%_12%,rgba(198,167,91,0.12),transparent_22%)]" />
        
        <div className="mx-auto grid max-w-7xl gap-14 pb-12 pt-12 lg:grid-cols-[1.05fr_.95fr] lg:items-center lg:pt-16">
          <div>
            <div className="mb-7 inline-flex items-center gap-2 rounded-none border border-emerald-200/15 bg-emerald-300/[0.06] px-3 py-1.5 text-xs font-semibold text-emerald-100/80"><Sparkles size={14} className="text-[#d8bb70]" />Karnataka State Police · State Crime Records Bureau</div>
            <h1 className="font-display max-w-3xl text-4xl font-semibold leading-[1.14] tracking-[-0.045em] text-white sm:text-5xl lg:text-6xl">Intelligence that reveals the story behind every incident.</h1>
            <p className="mt-7 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">A unified intelligence workspace for turning fragmented crime records into clear geographic insight, connected investigations, and proactive action.</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link to="/dashboard" className="inline-flex items-center justify-center gap-2 rounded-none bg-[#c6a75b] px-5 py-3.5 text-sm font-bold text-[#11231e] transition hover:-translate-y-0.5 hover:bg-[#e0c477]">Open command centre <ArrowRight size={17} /></Link>
              <a href="#capabilities" className="inline-flex items-center justify-center gap-2 rounded-none border border-white/12 bg-white/[0.035] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-white/[0.08]">Explore capabilities <ChevronDown size={17} /></a>
            </div>
            <div className="mt-12 flex flex-wrap gap-x-8 gap-y-4 border-t border-white/10 pt-7 text-sm">
              <div><span className="font-display text-xl font-semibold text-[#d8bb70]">360°</span><span className="ml-2 text-slate-400">case intelligence</span></div>
              <div><span className="font-display text-xl font-semibold text-[#d8bb70]">24/7</span><span className="ml-2 text-slate-400">trend monitoring</span></div>
              <div><span className="font-display text-xl font-semibold text-[#d8bb70]">1</span><span className="ml-2 text-slate-400">connected workspace</span></div>
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-xl">
            <div className="absolute -inset-3 rounded-none bg-gradient-to-br from-emerald-300/15 via-transparent to-[#c6a75b]/10 blur-xl" />
            <div className="relative overflow-hidden rounded-none border border-white/10 bg-[#0c211b]/95 p-4 shadow-2xl shadow-black/35">
              <div className="mb-4 flex items-center justify-between px-2 pt-1">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-100/45">Live intelligence view</p>
                  <p className="mt-1 text-sm font-semibold text-white">Karnataka overview</p>
                </div>
                <span className="rounded-none bg-emerald-300/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-200">Live</span>
              </div>
              <div className="relative h-72 overflow-hidden rounded-none border border-emerald-100/10 bg-[#102a23] sm:h-80">
                <div className="absolute inset-0 opacity-35 [background-image:linear-gradient(rgba(120,200,168,.18)_1px,transparent_1px),linear-gradient(90deg,rgba(120,200,168,.18)_1px,transparent_1px)] [background-size:38px_38px]" />
                <Dot className="left-[16%] top-[24%] bg-[#efcf76] ring-[#efcf76]/10" />
                <Dot className="left-[48%] top-[42%] bg-[#fd765d] ring-[#fd765d]/10" />
                <Dot className="right-[16%] top-[25%] bg-[#efcf76] ring-[#efcf76]/10" />
                <Dot className="bottom-[16%] left-[31%] bg-[#49c6a2] ring-[#49c6a2]/10" />
                <Dot className="bottom-[21%] right-[24%] bg-[#fd765d] ring-[#fd765d]/10" />
                <div className="absolute bottom-4 left-4 rounded-none border border-white/10 bg-[#07110f]/80 px-3 py-2.5 backdrop-blur">
                  <p className="text-[10px] uppercase tracking-widest text-slate-400">Emerging signal</p>
                  <p className="mt-1 text-xs font-semibold text-white">Bengaluru Urban · property crime</p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3">
                <Metric label="Active alerts" value="08" tone="text-[#f3c968]" />
                <Metric label="Network links" value="1,284" tone="text-emerald-200" />
                <Metric label="Cases analysed" value="18.6k" tone="text-white" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

const Dot = ({ className }: { className: string }) => <span className={`absolute h-3 w-3 rounded-full ring-8 ${className}`} />;
const Metric = ({ label, value, tone }: { label: string; value: string; tone: string }) => <div className="rounded-none border border-white/8 bg-white/[0.035] p-3"><p className="text-[10px] text-slate-400">{label}</p><p className={`font-display mt-1 text-lg font-semibold ${tone}`}>{value}</p></div>;

export default Hero;
