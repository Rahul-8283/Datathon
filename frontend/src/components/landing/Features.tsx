import { BrainCircuit, MapPinned, Network, Radar } from 'lucide-react';

const features = [
  { icon: MapPinned, title: 'Spatial intelligence', text: 'District and station-level maps reveal crime concentration, movement, and time-sensitive hotspots.' },
  { icon: Network, title: 'Network discovery', text: 'Connect people, phones, vehicles, places, and cases to make hidden associations visible.' },
  { icon: BrainCircuit, title: 'Predictive insight', text: 'Forecast pressure points, identify anomalies, and bring emerging patterns to analyst attention.' },
  { icon: Radar, title: 'Actionable alerts', text: 'Compare current signals with historical baselines for focused, evidence-led intervention.' },
];

const Features = () => <section id="capabilities" className="border-y border-white/8 bg-[#0a1915] px-5 py-24 sm:px-8 lg:px-12"><div className="mx-auto max-w-7xl"><div className="max-w-2xl"><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#d8bb70]">Built for intelligence-led policing</p><h2 className="font-display mt-4 text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl">From fragmented records to a connected understanding.</h2></div><div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{features.map(({ icon: Icon, title, text }, index) => <article key={title} className="group rounded-none border border-white/8 bg-white/[0.025] p-6 transition duration-300 hover:-translate-y-1 hover:border-emerald-200/25 hover:bg-emerald-200/[0.045]"><span className="grid h-11 w-11 place-items-center rounded-none bg-[#c6a75b]/12 text-[#e1c879]"><Icon size={21} /></span><p className="mt-8 text-xs font-bold text-emerald-100/40">0{index + 1}</p><h3 className="font-display mt-2 text-lg font-semibold text-white">{title}</h3><p className="mt-3 text-sm leading-6 text-slate-400">{text}</p></article>)}</div></div></section>;

export default Features;
