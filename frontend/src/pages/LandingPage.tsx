import { useEffect } from 'react';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import Hero from '../components/landing/Hero';
import Features from '../components/landing/Features';
import HowItWorks from '../components/landing/HowItWorks';
import CallToAction from '../components/landing/CallToAction';

const LandingPage = () => {
  useEffect(() => {
    const lenis = new Lenis({ autoRaf: true, lerp: 0.085 });
    return () => lenis.destroy();
  }, []);

  return (
    <div className="min-h-screen overflow-hidden bg-[#07110f] text-slate-200 selection:bg-[#c6a75b]/35">
      <main><Hero /><Features /><HowItWorks /><CallToAction /></main>
      <footer className="border-t border-white/8 px-5 py-7 text-center text-xs text-slate-500">© 2026 Karnataka State Police · Strategic Crime Intelligence Hub</footer>
    </div>
  );
};

export default LandingPage;
