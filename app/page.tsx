"use client";

import { useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import FounderTable from "../components/FounderTable";
import AboutSection from "../components/AboutSection";

gsap.registerPlugin(ScrollTrigger);

const NetworkGraph = dynamic(() => import("../components/NetworkGraph"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-[#C9A84C] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-gray-500 text-sm">Building network graph...</p>
      </div>
    </div>
  ),
});

const NAV_LINKS = [
  { id: "graph", label: "Network Map" },
  { id: "founders", label: "Founders" },
  { id: "about", label: "About" },
];

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function Home() {
  const foundersSectionRef = useRef<HTMLElement>(null);
  const aboutSectionRef = useRef<HTMLElement>(null);
  const graphHeaderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const sections = [foundersSectionRef.current, aboutSectionRef.current].filter(Boolean) as HTMLElement[];
      sections.forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: {
              trigger: el,
              start: "top 85%",
              toggleActions: "play none none none",
            },
          }
        );
      });
      if (graphHeaderRef.current) {
        gsap.fromTo(
          graphHeaderRef.current,
          { opacity: 0, y: -20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            ease: "power2.out",
            scrollTrigger: {
              trigger: graphHeaderRef.current,
              start: "top 85%",
              toggleActions: "play none none none",
            },
          }
        );
      }
    });
    return () => ctx.revert();
  }, []);

  return (
    <div className="min-h-screen" style={{ background: "#0B1426", color: "#fff" }}>
      {/* Header */}
      <header
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 border-b border-white/10"
        style={{ background: "rgba(11,20,38,0.92)", backdropFilter: "blur(12px)" }}
      >
        <div className="flex items-center gap-3">
          <span className="text-[#C9A84C] font-bold text-lg tracking-tight">USV</span>
          <span className="text-white/30 text-sm hidden sm:block">|</span>
          <span className="text-gray-300 text-sm hidden sm:block">Portfolio Network Map</span>
        </div>
        <nav className="flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <button
              key={link.id}
              onClick={() => scrollTo(link.id)}
              className="px-3 py-1.5 text-sm text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-all"
            >
              {link.label}
            </button>
          ))}
        </nav>
      </header>

      {/* Hero */}
      <div className="relative pt-24 pb-10 px-6 text-center overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 70% 40% at 50% 0%, rgba(201,168,76,0.08) 0%, transparent 70%)" }}
        />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: "easeOut" }}>
          <p className="text-[11px] uppercase tracking-widest text-[#C9A84C] mb-4">
            Union Square Ventures, Since 2003
          </p>
          <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight mb-4">
            The Portfolio<br />
            <span style={{ color: "#C9A84C" }}>as a Network</span>
          </h1>
          <p className="text-gray-400 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            42 portfolio companies. 80 plus founders. One thesis: large networks of engaged users compound in value over time. Explore the human infrastructure behind USV.
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="flex justify-center gap-8 mt-8"
        >
          {[
            { value: "42", label: "Companies" },
            { value: "80+", label: "Founders" },
            { value: "6", label: "Sectors" },
            { value: "22yrs", label: "Track Record" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl font-bold text-[#C9A84C]">{stat.value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{stat.label}</div>
            </div>
          ))}
        </motion.div>
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          onClick={() => scrollTo("graph")}
          className="mt-8 px-6 py-2.5 rounded-full text-sm font-medium border border-[#C9A84C]/40 text-[#C9A84C] hover:bg-[#C9A84C]/10 transition-all"
        >
          Explore the map
        </motion.button>
      </div>

      {/* Section 1: Network Graph */}
      <section id="graph" className="px-4 md:px-8 mb-16">
        <div ref={graphHeaderRef} className="mb-5">
          <p className="text-[11px] uppercase tracking-widest text-[#C9A84C] mb-1">Section 01</p>
          <h2 className="text-2xl font-bold text-white">Portfolio Network Graph</h2>
          <p className="text-gray-400 text-sm mt-1 max-w-xl">
            Force-directed graph of USV portfolio companies. Nodes sized by funding raised, colored by sector. Lines connect companies whose founders share prior employers.
          </p>
        </div>
        <div
          className="w-full rounded-2xl border border-white/10 overflow-hidden"
          style={{ height: "72vh", minHeight: 480, background: "#0B1426" }}
        >
          <NetworkGraph />
        </div>
      </section>

      {/* Section 2: Founder Table */}
      <section id="founders" ref={foundersSectionRef} className="px-4 md:px-8 mb-16" style={{ opacity: 0 }}>
        <div className="mb-6">
          <p className="text-[11px] uppercase tracking-widest text-[#C9A84C] mb-1">Section 02</p>
          <h2 className="text-2xl font-bold text-white">Founder Background Explorer</h2>
          <p className="text-gray-400 text-sm mt-1 max-w-xl">
            Every founder across the USV portfolio. Filter by university or prior employer. Sort by Connection Score to surface the tightest institutional clusters.
          </p>
        </div>
        <FounderTable />
      </section>

      {/* Section 3: About */}
      <section id="about" ref={aboutSectionRef} className="px-4 md:px-8 pb-24" style={{ opacity: 0 }}>
        <div className="mb-6">
          <p className="text-[11px] uppercase tracking-widest text-[#C9A84C] mb-1">Section 03</p>
          <h2 className="text-2xl font-bold text-white">About This Project</h2>
        </div>
        <AboutSection />
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <span className="text-gray-600 text-xs">Built by Sahil Modi for the USV Analyst Program application.</span>
        <span className="text-gray-700 text-xs">Data from public sources. Not affiliated with Union Square Ventures.</span>
      </footer>
    </div>
  );
}
