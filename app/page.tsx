"use client";

import { useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import FounderTable from "../components/FounderTable";
import AboutSection from "../components/AboutSection";
import InvestmentPitches from "../components/InvestmentPitches";

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
  { id: "pitches", label: "Pitches" },
  { id: "about", label: "About" },
];

const STATS = [
  { value: "42", label: "Companies" },
  { value: "80+", label: "Founders" },
  { value: "6", label: "Sectors" },
  { value: "22yrs", label: "Track Record" },
];

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function Home() {
  const navRef = useRef<HTMLElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const heroBg1Ref = useRef<HTMLDivElement>(null);
  const heroBg2Ref = useRef<HTMLDivElement>(null);
  const graphSectionRef = useRef<HTMLElement>(null);
  const foundersSectionRef = useRef<HTMLElement>(null);
  const aboutSectionRef = useRef<HTMLElement>(null);
  const pitchesSectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero parallax: far layer (slowest — appears deepest)
      if (heroBg1Ref.current) {
        gsap.to(heroBg1Ref.current, {
          y: "32%",
          ease: "none",
          scrollTrigger: {
            trigger: heroRef.current,
            start: "top top",
            end: "bottom top",
            scrub: 0.8,
          },
        });
      }

      // Hero parallax: mid layer (medium speed)
      if (heroBg2Ref.current) {
        gsap.to(heroBg2Ref.current, {
          y: "16%",
          ease: "none",
          scrollTrigger: {
            trigger: heroRef.current,
            start: "top top",
            end: "bottom top",
            scrub: 0.8,
          },
        });
      }

      // Nav: activate frosted glass after hero scrolls past
      ScrollTrigger.create({
        trigger: heroRef.current,
        start: "bottom 72px",
        onEnter: () => navRef.current?.setAttribute("data-scrolled", "true"),
        onLeaveBack: () => navRef.current?.removeAttribute("data-scrolled"),
      });

      // Graph section: fade + slide up from below
      if (graphSectionRef.current) {
        gsap.set(graphSectionRef.current, { opacity: 0, y: 70 });
        gsap.to(graphSectionRef.current, {
          opacity: 1,
          y: 0,
          duration: 1.05,
          ease: "power3.out",
          scrollTrigger: {
            trigger: graphSectionRef.current,
            start: "top 84%",
            toggleActions: "play none none none",
          },
        });
      }

      // Founders section: header then table staggered
      if (foundersSectionRef.current) {
        const header = foundersSectionRef.current.querySelector(".section-header");
        const tableWrap = foundersSectionRef.current.querySelector(".table-wrap");

        gsap.set([header, tableWrap].filter(Boolean), { opacity: 0, y: 48 });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: foundersSectionRef.current,
            start: "top 82%",
            toggleActions: "play none none none",
          },
        });
        if (header) tl.to(header, { opacity: 1, y: 0, duration: 0.75, ease: "power2.out" });
        if (tableWrap) tl.to(tableWrap, { opacity: 1, y: 0, duration: 0.85, ease: "power2.out" }, "-=0.45");
      }

      // About section: slide up
      if (aboutSectionRef.current) {
        gsap.set(aboutSectionRef.current, { opacity: 0, y: 50 });
        gsap.to(aboutSectionRef.current, {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: "power2.out",
          scrollTrigger: {
            trigger: aboutSectionRef.current,
            start: "top 82%",
            toggleActions: "play none none none",
          },
        });
      }

      // Investment Pitches section: header reveals, then cards handled inside component
      if (pitchesSectionRef.current) {
        const header = pitchesSectionRef.current.querySelector(".section-header");
        if (header) {
          gsap.set(header, { opacity: 0, y: 36 });
          gsap.to(header, {
            opacity: 1,
            y: 0,
            duration: 0.75,
            ease: "power2.out",
            scrollTrigger: {
              trigger: header,
              start: "top 85%",
              toggleActions: "play none none none",
            },
          });
        }
      }
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="min-h-screen" style={{ background: "#0B1426", color: "#fff" }}>

      {/* Nav — starts transparent, frosts on scroll */}
      <header
        ref={navRef}
        id="main-nav"
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 border-b"
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

      {/* Hero with 3-layer parallax */}
      <div
        ref={heroRef}
        className="relative min-h-[90vh] flex flex-col items-center justify-center px-6 text-center overflow-hidden"
      >
        {/* Far layer — slowest parallax (32% travel) */}
        <div
          ref={heroBg1Ref}
          className="absolute inset-0 pointer-events-none"
          style={{ willChange: "transform" }}
        >
          <div
            className="absolute -top-24 left-1/2 -translate-x-1/2 w-[900px] h-[700px]"
            style={{ background: "radial-gradient(ellipse, rgba(201,168,76,0.11) 0%, transparent 65%)" }}
          />
          <div
            className="absolute -bottom-20 -right-24 w-[600px] h-[600px]"
            style={{ background: "radial-gradient(circle, rgba(139,92,246,0.07) 0%, transparent 65%)" }}
          />
        </div>

        {/* Mid layer — 16% travel */}
        <div
          ref={heroBg2Ref}
          className="absolute inset-0 pointer-events-none"
          style={{ willChange: "transform" }}
        >
          <div
            className="absolute top-[25%] left-[6%] w-[320px] h-[320px]"
            style={{ background: "radial-gradient(circle, rgba(59,130,246,0.07) 0%, transparent 65%)" }}
          />
          <div
            className="absolute top-[12%] right-[8%] w-[260px] h-[260px]"
            style={{ background: "radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 65%)" }}
          />
          <div
            className="absolute bottom-[10%] left-[30%] w-[200px] h-[200px]"
            style={{ background: "radial-gradient(circle, rgba(233,64,87,0.04) 0%, transparent 65%)" }}
          />
        </div>

        {/* Subtle gold grid (near layer, no transform = scrolls at full speed) */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(201,168,76,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,0.04) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />

        {/* Hero text (foreground, natural scroll speed) */}
        <div className="relative z-10 flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="text-[11px] uppercase tracking-widest text-[#C9A84C] mb-5">
              Union Square Ventures, Since 2003
            </p>
            <h1 className="text-5xl md:text-7xl font-bold text-white leading-[1.05] mb-5 tracking-tight">
              The Portfolio<br />
              <span style={{ color: "#C9A84C" }}>as a Network</span>
            </h1>
            <p className="text-gray-400 text-base md:text-lg max-w-xl mx-auto leading-relaxed">
              42 portfolio companies. 80 plus founders. One thesis: large networks of engaged users compound in value over time. Explore the human infrastructure behind USV.
            </p>
          </motion.div>

          {/* Stat cards with spring hover */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.38, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-wrap justify-center gap-3 mt-10"
          >
            {STATS.map((stat) => (
              <motion.div
                key={stat.label}
                whileHover={{ scale: 1.09, y: -6, boxShadow: "0 8px 32px rgba(201,168,76,0.18)" }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 420, damping: 18 }}
                className="text-center px-6 py-4 rounded-2xl border border-white/10 cursor-default select-none"
                style={{ background: "rgba(22,32,53,0.75)", backdropFilter: "blur(6px)" }}
              >
                <div className="text-2xl font-bold text-[#C9A84C]">{stat.value}</div>
                <div className="text-xs text-gray-500 mt-1 uppercase tracking-wider">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>

          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.65 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => scrollTo("graph")}
            className="mt-9 px-7 py-3 rounded-full text-sm font-medium border border-[#C9A84C]/40 text-[#C9A84C] hover:bg-[#C9A84C]/10 transition-colors"
          >
            Explore the map
          </motion.button>
        </div>

        {/* Scroll hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1"
        >
          <span className="text-[10px] uppercase tracking-widest text-gray-600">Scroll</span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
            className="w-px h-8 bg-gradient-to-b from-gray-600 to-transparent"
          />
        </motion.div>
      </div>

      {/* Section 1: Network Graph */}
      <section id="graph" ref={graphSectionRef} className="px-4 md:px-8 mb-20">
        <div className="section-header mb-6">
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
      <section id="founders" ref={foundersSectionRef} className="px-4 md:px-8 mb-20">
        <div className="section-header mb-6">
          <p className="text-[11px] uppercase tracking-widest text-[#C9A84C] mb-1">Section 02</p>
          <h2 className="text-2xl font-bold text-white">Founder Background Explorer</h2>
          <p className="text-gray-400 text-sm mt-1 max-w-xl">
            Every founder across the USV portfolio. Filter by university or prior employer. Sort by Connection Score to surface the tightest institutional clusters.
          </p>
        </div>
        <div className="table-wrap">
          <FounderTable />
        </div>
      </section>

      {/* Section 3: Investment Pitches */}
      <section id="pitches" ref={pitchesSectionRef} className="px-4 md:px-8 mb-20">
        <div className="section-header mb-3">
          <p className="text-[11px] uppercase tracking-widest text-[#C9A84C] mb-1">Section 03</p>
          <h2 className="text-2xl font-bold text-white">Investment Pitches</h2>
          <p className="text-gray-400 text-sm mt-1 max-w-2xl leading-relaxed">
            Four original investment memos on companies USV has not yet backed that fit the thesis of trusted networks broadening access to knowledge, capital, or well-being. Each memo argues the network effects case, the why now, and a recommendation. Click any card to expand the full memo.
          </p>
        </div>

        {/* Disclaimer */}
        <div className="mb-8 flex items-start gap-2.5 rounded-xl border border-[#C9A84C]/20 px-4 py-3 max-w-2xl"
          style={{ background: "rgba(201,168,76,0.04)" }}>
          <span className="text-[#C9A84C] text-xs mt-0.5 flex-shrink-0">Note</span>
          <p className="text-gray-500 text-xs leading-relaxed">
            These memos represent original analysis by Sahil Modi as part of his USV Analyst Program application. They are not affiliated with or endorsed by Union Square Ventures. All data from public sources as of May 2026.
          </p>
        </div>

        <InvestmentPitches />
      </section>

      {/* Section 4: About */}
      <section id="about" ref={aboutSectionRef} className="px-4 md:px-8 pb-28">
        <div className="section-header mb-6">
          <p className="text-[11px] uppercase tracking-widest text-[#C9A84C] mb-1">Section 04</p>
          <h2 className="text-2xl font-bold text-white">About This Project</h2>
        </div>
        <AboutSection />
      </section>

      <footer className="border-t border-white/10 px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <span className="text-gray-600 text-xs">Built by Sahil Modi for the USV Analyst Program application.</span>
        <span className="text-gray-700 text-xs">Data from public sources. Not affiliated with Union Square Ventures.</span>
      </footer>
    </div>
  );
}
