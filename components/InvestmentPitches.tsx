"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import pitchData from "../data/pitches.json";

gsap.registerPlugin(ScrollTrigger);

interface Pitch {
  id: string;
  company: string;
  sector: string;
  sectorColor: string;
  thesis: string;
  stage: string;
  raised: string;
  recommendation: "Invest" | "Monitor" | "Pass";
  recommendationRationale: string;
  investors: string;
  founded: number;
  founders: string;
  metrics: string;
  networkEffects: string;
  whyNow: string;
  tam: string;
  tamNote: string;
  risks: string[];
  riskMitigation: string;
}

const REC_STYLE = {
  Invest: {
    bg: "rgba(16,185,129,0.12)",
    text: "#10B981",
    border: "rgba(16,185,129,0.35)",
    label: "INVEST",
  },
  Monitor: {
    bg: "rgba(201,168,76,0.12)",
    text: "#C9A84C",
    border: "rgba(201,168,76,0.35)",
    label: "MONITOR",
  },
  Pass: {
    bg: "rgba(233,64,87,0.12)",
    text: "#E94057",
    border: "rgba(233,64,87,0.35)",
    label: "PASS",
  },
};

function MemoBlock({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-widest text-[#C9A84C] mb-2">{label}</p>
      {children}
    </div>
  );
}

function PitchCard({ pitch, index }: { pitch: Pitch; index: number }) {
  const [open, setOpen] = useState(false);
  const rec = REC_STYLE[pitch.recommendation] ?? REC_STYLE.Monitor;

  return (
    <motion.div
      className="pitch-card rounded-2xl border border-white/10 overflow-hidden flex flex-col"
      style={{ background: "#162035" }}
      whileHover={!open ? { y: -6, boxShadow: "0 16px 48px rgba(0,0,0,0.45)" } : {}}
      transition={{ type: "spring", stiffness: 340, damping: 24 }}
      layout
    >
      {/* Always-visible header */}
      <div
        className="p-6 cursor-pointer select-none"
        onClick={() => setOpen((v) => !v)}
      >
        {/* Top row */}
        <div className="flex items-start justify-between gap-3 mb-5 flex-wrap">
          <span
            className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded"
            style={{ background: pitch.sectorColor + "1A", color: pitch.sectorColor }}
          >
            {pitch.sector}
          </span>
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="text-[11px] font-bold px-3 py-1 rounded-full border"
              style={{ background: rec.bg, color: rec.text, borderColor: rec.border }}
            >
              {rec.label}
            </span>
            <span className="text-[11px] text-gray-500 bg-white/5 px-2.5 py-1 rounded-full whitespace-nowrap">
              {pitch.stage} · {pitch.raised}
            </span>
          </div>
        </div>

        {/* Company name + thesis */}
        <h3 className="text-xl font-bold text-white mb-2 leading-snug">{pitch.company}</h3>
        <p className="text-gray-400 text-sm leading-relaxed">{pitch.thesis}</p>

        {/* Meta row */}
        <div className="flex flex-wrap gap-3 mt-4 text-[11px] text-gray-600">
          <span>Founded {pitch.founded}</span>
          <span>·</span>
          <span>{pitch.metrics}</span>
          <span>·</span>
          <span>{pitch.founders}</span>
        </div>

        {/* Toggle row */}
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/8">
          <span className="text-[12px] text-[#C9A84C]">
            {open ? "Close memo" : "Read full memo"}
          </span>
          <motion.span
            animate={{ rotate: open ? 180 : 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="text-[#C9A84C] text-xs leading-none"
          >
            ↓
          </motion.span>
        </div>
      </div>

      {/* Expandable memo body */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="memo"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
            style={{ overflow: "hidden" }}
          >
            <div className="border-t border-white/10 px-6 pb-6 pt-5 space-y-6">

              <MemoBlock label="Network Effects">
                <p className="text-gray-300 text-sm leading-relaxed">{pitch.networkEffects}</p>
              </MemoBlock>

              <MemoBlock label="Why Now">
                <p className="text-gray-300 text-sm leading-relaxed">{pitch.whyNow}</p>
              </MemoBlock>

              <MemoBlock label={`Market Size · ${pitch.tam} TAM`}>
                <p className="text-gray-300 text-sm leading-relaxed">{pitch.tamNote}</p>
              </MemoBlock>

              <MemoBlock label="Key Risks">
                <ul className="space-y-2 mb-3">
                  {pitch.risks.map((risk, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-gray-400">
                      <span className="mt-1.5 w-1 h-1 rounded-full flex-shrink-0 bg-[#E94057]" />
                      {risk}
                    </li>
                  ))}
                </ul>
                <p className="text-gray-400 text-sm leading-relaxed">{pitch.riskMitigation}</p>
              </MemoBlock>

              {/* Recommendation callout */}
              <div
                className="rounded-xl p-4 border"
                style={{ background: rec.bg, borderColor: rec.border }}
              >
                <p
                  className="text-[10px] font-bold uppercase tracking-widest mb-2"
                  style={{ color: rec.text }}
                >
                  Recommendation: {pitch.recommendation}
                </p>
                <p className="text-gray-300 text-sm leading-relaxed">{pitch.recommendationRationale}</p>
              </div>

              {/* Footer metadata */}
              <div className="pt-3 border-t border-white/10 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-gray-600">
                <span>Backed by: {pitch.investors}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function InvestmentPitches() {
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const cards = document.querySelectorAll<HTMLElement>(".pitch-card");
      cards.forEach((card, i) => {
        gsap.set(card, { opacity: 0, y: 52 });
        gsap.to(card, {
          opacity: 1,
          y: 0,
          duration: 0.75,
          ease: "power2.out",
          scrollTrigger: {
            trigger: card,
            start: "top 89%",
            toggleActions: "play none none none",
          },
          delay: i * 0.12,
        });
      });
    }, wrapperRef);

    return () => ctx.revert();
  }, []);

  const pitches = pitchData.pitches as Pitch[];

  return (
    <div ref={wrapperRef} className="grid md:grid-cols-2 gap-5">
      {pitches.map((pitch, i) => (
        <PitchCard key={pitch.id} pitch={pitch} index={i} />
      ))}
    </div>
  );
}
