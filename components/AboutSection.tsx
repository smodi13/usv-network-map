"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const points = [
  {
    title: "Why this exists",
    body: "Before applying to USV's Analyst Program, I wanted to understand how the firm actually thinks about networks. So I built a tool to find out. This project maps the human infrastructure behind USV's portfolio: who the founders are, where they came from, and how they are connected to each other.",
  },
  {
    title: "What it demonstrates",
    body: "The graph makes a simple point visually: USV does not just back companies, it backs nodes in a human network. Founders who trained at the same institutions, worked at the same firms, and move in the same circles keep surfacing in the portfolio. That pattern is the thesis made visible.",
  },
  {
    title: "Sourcing instinct",
    body: "The analyst role at USV is shifting toward relationship-building inside human networks, surfacing founders before they are obvious. That means being embedded in the communities where the next wave is forming, not just reading TechCrunch. This tool was built to practice that kind of pattern recognition.",
  },
  {
    title: "Thematic judgment",
    body: "USV's thesis, networks of engaged users that get stronger as they grow, shows up clearly in the data. Social platforms, marketplaces, developer tools, financial infrastructure: each sector in this portfolio creates more value for every user who joins. The firm has been remarkably consistent about this for over two decades.",
  },
];

export default function AboutSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <div ref={ref} className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="mb-10"
      >
        <p className="text-[11px] uppercase tracking-widest text-[#C9A84C] mb-3">About this project</p>
        <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight">
          Built to understand USV<br />
          <span className="text-gray-400 font-normal">before applying to USV.</span>
        </h2>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-5 mb-12">
        {points.map((p, i) => (
          <motion.div
            key={p.title}
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.55, delay: 0.1 + i * 0.1, ease: "easeOut" }}
            className="rounded-xl border border-white/10 p-6"
            style={{ background: "#162035" }}
          >
            <h3 className="text-[#C9A84C] font-semibold text-sm mb-3 uppercase tracking-wide">{p.title}</h3>
            <p className="text-gray-300 text-sm leading-relaxed">{p.body}</p>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.55, delay: 0.55, ease: "easeOut" }}
        className="rounded-xl border border-[#C9A84C]/30 p-8"
        style={{ background: "#162035" }}
      >
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className="flex-1">
            <p className="text-[11px] uppercase tracking-widest text-[#C9A84C] mb-2">Built by</p>
            <h3 className="text-2xl font-bold text-white mb-1">Sahil Modi</h3>
            <p className="text-gray-400 text-sm">
              Finance and data-driven strategy background, focused on sourcing and thematic research at the intersection of technology and capital markets. Applying to the USV Analyst Program.
            </p>
          </div>
          <div className="flex flex-col gap-3 md:items-end">
            <a
              href="mailto:modi.sahil@gmail.com"
              className="flex items-center gap-2 text-sm text-gray-300 hover:text-[#C9A84C] transition-colors group"
            >
              <span className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-xs group-hover:border-[#C9A84C]/40 transition-colors">@</span>
              modi.sahil@gmail.com
            </a>
            <a
              href="tel:+16025357223"
              className="flex items-center gap-2 text-sm text-gray-300 hover:text-[#C9A84C] transition-colors group"
            >
              <span className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-xs group-hover:border-[#C9A84C]/40 transition-colors">#</span>
              (602) 535-7223
            </a>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-white/10">
          <p className="text-[12px] text-gray-500 leading-relaxed">
            All portfolio and founder data compiled from public sources including Crunchbase, PitchBook, LinkedIn, and company websites. Node size scales with total funding raised. Connection Score reflects shared undergraduate institutions and prior employers among USV-backed founders. This tool was built as an independent research project and is not affiliated with Union Square Ventures.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
