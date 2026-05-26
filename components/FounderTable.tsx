"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import portfolioData from "../data/portfolio.json";

interface Founder {
  name: string;
  role: string;
  priorCompany: string;
  university: string;
}

interface Company {
  id: string;
  name: string;
  sector: string;
  founders: Founder[];
}

interface FounderRow {
  name: string;
  company: string;
  sector: string;
  priorCompany: string;
  university: string;
  connectionScore: number;
}

function normalizeUniversity(raw: string): string {
  const s = raw.toLowerCase();
  if (s.includes("harvard")) return "Harvard";
  if (s.includes("wharton") || (s.includes("penn") && !s.includes("northwestern"))) return "UPenn";
  if (s.includes("stanford")) return "Stanford";
  if (s.includes("mit") || s.includes("massachusetts inst")) return "MIT";
  if (s.includes("michigan")) return "Michigan";
  if (s.includes("yale")) return "Yale";
  if (s.includes("cornell")) return "Cornell";
  if (s.includes("brown")) return "Brown";
  if (s.includes("duke")) return "Duke";
  if (s.includes("princeton")) return "Princeton";
  if (s.includes("columbia")) return "Columbia";
  if (s.includes("waterloo")) return "Waterloo";
  if (s.includes("nyu") || s.includes("new york university")) return "NYU";
  if (s.includes("uc davis")) return "UC Davis";
  if (s.includes("uc berkeley") || s.includes("berkeley")) return "UC Berkeley";
  if (s.includes("uc santa barbara") || s.includes("ucsb")) return "UC Santa Barbara";
  if (s.includes("chicago")) return "U of Chicago";
  if (s.includes("northwestern")) return "Northwestern";
  if (s.includes("mcgill")) return "McGill";
  if (s.includes("suny")) return "SUNY";
  if (s.includes("rice")) return "Rice";
  if (s.includes("virginia")) return "UVA";
  if (s.includes("no college") || s.includes("no degree") || s.includes("self-taught") || s.includes("homeschool")) return "No degree";
  return raw.trim();
}

function normalizeEmployer(raw: string): string[] {
  return raw
    .split(",")
    .map((e) => {
      const s = e.toLowerCase().trim();
      if (s.includes("doubleclick")) return "DoubleClick";
      if (s.includes("google")) return "Google";
      if (s.includes("amazon")) return "Amazon";
      if (s.includes("microsoft")) return "Microsoft";
      if (s.includes("mckinsey")) return "McKinsey";
      if (s.includes("angellist")) return "AngelList";
      if (s.includes("goldman")) return "Goldman Sachs";
      if (s.includes("odeo")) return "Odeo";
      if (s.includes("powerset")) return "Powerset";
      if (s.includes("serveraxis")) return "ServerAxis";
      if (s.includes("wildcard")) return "Wildcard";
      if (s.includes("axiom zen")) return "Axiom Zen";
      if (s.includes("postmates")) return "Postmates";
      if (s.includes("sparknetworks")) return "SparkNetworks";
      if (s.includes("stripe")) return "Stripe";
      if (s === "none" || s === "" || s === "n/a") return null;
      return e.trim();
    })
    .filter(Boolean) as string[];
}

type SortKey = "name" | "company" | "university" | "connectionScore";
type SortDir = "asc" | "desc";

const SECTOR_COLORS: Record<string, string> = {
  Social: "#E94057",
  Marketplace: "#F59E0B",
  Fintech: "#10B981",
  Infrastructure: "#8B5CF6",
  Consumer: "#3B82F6",
  Healthcare: "#14B8A6",
};

const ROW_VARIANTS = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: Math.min(i * 0.028, 0.55),
      duration: 0.42,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  }),
};

export default function FounderTable() {
  const [sortKey, setSortKey] = useState<SortKey>("connectionScore");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [uniFilter, setUniFilter] = useState("");
  const [employerFilter, setEmployerFilter] = useState("");

  // Viewport gate + re-stagger trigger
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [animKey, setAnimKey] = useState(0);
  const [inView, setInView] = useState(false);
  const filterStateRef = useRef(`${uniFilter}-${employerFilter}-${sortKey}-${sortDir}`);

  // Watch for section entering viewport (fires only once)
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          setAnimKey((k) => k + 1);
          obs.disconnect();
        }
      },
      { threshold: 0.06 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Re-stagger whenever filter/sort changes (only after first in-view)
  const filterState = `${uniFilter}-${employerFilter}-${sortKey}-${sortDir}`;
  useEffect(() => {
    if (inView && filterStateRef.current !== filterState) {
      filterStateRef.current = filterState;
      setAnimKey((k) => k + 1);
    }
  }, [filterState, inView]);

  const companies = portfolioData.companies as Company[];

  const rows: FounderRow[] = useMemo(() => {
    const allFounders: {
      name: string;
      company: string;
      sector: string;
      priorCompany: string;
      university: string;
      employers: string[];
      uniNorm: string;
    }[] = [];

    companies.forEach((c) => {
      c.founders.forEach((f) => {
        allFounders.push({
          name: f.name,
          company: c.name,
          sector: c.sector,
          priorCompany: f.priorCompany,
          university: f.university,
          employers: normalizeEmployer(f.priorCompany),
          uniNorm: normalizeUniversity(f.university),
        });
      });
    });

    return allFounders.map((f) => {
      let score = 0;
      allFounders.forEach((other) => {
        if (other.name === f.name) return;
        if (f.uniNorm !== "No degree" && f.uniNorm === other.uniNorm) score++;
        f.employers.forEach((emp) => {
          if (other.employers.includes(emp)) score++;
        });
      });
      return {
        name: f.name,
        company: f.company,
        sector: f.sector,
        priorCompany: f.priorCompany,
        university: f.university,
        connectionScore: score,
      };
    });
  }, [companies]);

  const universities = useMemo(() => {
    const set = new Set(rows.map((r) => normalizeUniversity(r.university)).filter((u) => u !== "No degree"));
    return ["", ...Array.from(set).sort()];
  }, [rows]);

  const employers = useMemo(() => {
    const set = new Set<string>();
    rows.forEach((r) => normalizeEmployer(r.priorCompany).forEach((e) => set.add(e)));
    return ["", ...Array.from(set).sort()];
  }, [rows]);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      const uniMatch = !uniFilter || normalizeUniversity(r.university) === uniFilter;
      const empMatch = !employerFilter || normalizeEmployer(r.priorCompany).includes(employerFilter);
      return uniMatch && empMatch;
    });
  }, [rows, uniFilter, employerFilter]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let av: string | number = a[sortKey];
      let bv: string | number = b[sortKey];
      if (typeof av === "string") av = av.toLowerCase();
      if (typeof bv === "string") bv = bv.toLowerCase();
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }, [filtered, sortKey, sortDir]);

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "connectionScore" ? "desc" : "asc");
    }
  }

  const SortIcon = ({ k }: { k: SortKey }) => {
    if (sortKey !== k) return <span className="text-gray-600 ml-1">↕</span>;
    return <span className="text-[#C9A84C] ml-1">{sortDir === "asc" ? "↑" : "↓"}</span>;
  };

  const selectClass =
    "bg-[#0B1426] border border-white/10 text-gray-300 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-[#C9A84C]/50 transition-colors";

  return (
    <div ref={wrapperRef}>
      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex flex-wrap gap-3 mb-6"
      >
        <div className="flex flex-col gap-1">
          <label className="text-[10px] uppercase tracking-widest text-gray-500">Filter by University</label>
          <select className={selectClass} value={uniFilter} onChange={(e) => setUniFilter(e.target.value)}>
            {universities.map((u) => (
              <option key={u} value={u}>{u || "All Universities"}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[10px] uppercase tracking-widest text-gray-500">Filter by Prior Employer</label>
          <select className={selectClass} value={employerFilter} onChange={(e) => setEmployerFilter(e.target.value)}>
            {employers.map((e) => (
              <option key={e} value={e}>{e || "All Employers"}</option>
            ))}
          </select>
        </div>
        {(uniFilter || employerFilter) && (
          <div className="flex flex-col justify-end">
            <button
              onClick={() => { setUniFilter(""); setEmployerFilter(""); }}
              className="text-sm text-[#C9A84C] hover:text-white transition-colors pb-2"
            >
              Clear filters
            </button>
          </div>
        )}
        <div className="ml-auto flex flex-col justify-end">
          <AnimatePresence mode="wait">
            <motion.span
              key={sorted.length}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.2 }}
              className="text-sm text-gray-500 pb-2"
            >
              {sorted.length} founder{sorted.length !== 1 ? "s" : ""}
            </motion.span>
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: "#162035" }}>
              {(
                [
                  { key: "name", label: "Founder" },
                  { key: "company", label: "Company" },
                  { key: null, label: "Sector" },
                  { key: null, label: "Prior Company" },
                  { key: "university", label: "University" },
                  { key: "connectionScore", label: "Connection Score" },
                ] as { key: SortKey | null; label: string }[]
              ).map(({ key, label }) => (
                <th
                  key={label}
                  onClick={() => key && handleSort(key)}
                  className={`px-4 py-3 text-left text-[11px] uppercase tracking-widest text-gray-400 whitespace-nowrap select-none ${
                    key ? "cursor-pointer hover:text-white transition-colors" : ""
                  }`}
                >
                  {label}
                  {key && <SortIcon k={key} />}
                </th>
              ))}
            </tr>
          </thead>

          {/* Key on tbody forces full remount on each filter/sort change, re-triggering stagger */}
          <tbody key={animKey}>
            {sorted.map((row, i) => (
              <motion.tr
                key={`${row.name}-${row.company}`}
                custom={i}
                variants={ROW_VARIANTS}
                initial="hidden"
                animate={inView ? "visible" : "hidden"}
                className="border-t border-white/5 hover:bg-white/[0.03] transition-colors"
                style={{ background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.015)" }}
              >
                <td className="px-4 py-3 font-medium text-white whitespace-nowrap">{row.name}</td>
                <td className="px-4 py-3 text-gray-300 whitespace-nowrap">{row.company}</td>
                <td className="px-4 py-3">
                  <span
                    className="text-[11px] px-2 py-0.5 rounded-full whitespace-nowrap"
                    style={{
                      background: (SECTOR_COLORS[row.sector] ?? "#666") + "22",
                      color: SECTOR_COLORS[row.sector] ?? "#aaa",
                    }}
                  >
                    {row.sector}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-400 max-w-[180px] truncate">{row.priorCompany}</td>
                <td className="px-4 py-3 text-gray-300 whitespace-nowrap">{row.university}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 max-w-[60px] bg-white/10 rounded-full h-1.5 overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        initial={{ width: 0 }}
                        animate={inView ? { width: `${Math.min(100, (row.connectionScore / 8) * 100)}%` } : { width: 0 }}
                        transition={{ delay: Math.min(i * 0.028, 0.55) + 0.25, duration: 0.5, ease: "easeOut" }}
                        style={{ background: "#C9A84C" }}
                      />
                    </div>
                    <span className="text-[#C9A84C] font-semibold tabular-nums w-4 text-right">{row.connectionScore}</span>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>

        {sorted.length === 0 && (
          <div className="py-12 text-center text-gray-500">No founders match the selected filters.</div>
        )}
      </div>

      <p className="mt-3 text-[11px] text-gray-600">
        Connection Score counts other USV founders who share the same undergraduate institution or prior employer.
      </p>
    </div>
  );
}
