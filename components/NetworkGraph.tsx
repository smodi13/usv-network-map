"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import * as d3 from "d3";
import { motion, AnimatePresence } from "framer-motion";
import portfolioData from "../data/portfolio.json";

type Sector = "Consumer" | "Fintech" | "Infrastructure" | "Marketplace" | "Social" | "Healthcare";

interface Founder {
  name: string;
  role: string;
  priorCompany: string;
  university: string;
}

interface Company {
  id: string;
  name: string;
  sector: Sector;
  fundingM: number;
  founded: number;
  status: string;
  description: string;
  founders: Founder[];
}

interface GraphNode extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  sector: Sector;
  fundingM: number;
  radius: number;
  company: Company;
}

interface GraphLink extends d3.SimulationLinkDatum<GraphNode> {
  type: string;
  reason?: string;
}

const SECTOR_COLORS: Record<Sector, string> = {
  Social: "#E94057",
  Marketplace: "#F59E0B",
  Fintech: "#10B981",
  Infrastructure: "#8B5CF6",
  Consumer: "#3B82F6",
  Healthcare: "#14B8A6",
};

function normalizeEmployer(raw: string): string {
  const s = raw.toLowerCase().trim();
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
  if (s.includes("skurt")) return "Skurt";
  if (s.includes("stripe")) return "Stripe";
  return raw.trim();
}

function computeLinks(companies: Company[]): { source: string; target: string; type: string; reason: string }[] {
  const links: { source: string; target: string; type: string; reason: string }[] = [];
  const seen = new Set<string>();

  const employerMap: Record<string, string[]> = {};

  companies.forEach((company) => {
    company.founders.forEach((founder) => {
      founder.priorCompany
        .split(",")
        .map((e) => normalizeEmployer(e))
        .filter((e) => e && e !== "None" && e !== "No college" && e !== "None" && e.length > 2)
        .forEach((emp) => {
          if (!employerMap[emp]) employerMap[emp] = [];
          if (!employerMap[emp].includes(company.id)) {
            employerMap[emp].push(company.id);
          }
        });
    });
  });

  Object.entries(employerMap).forEach(([emp, companyIds]) => {
    if (companyIds.length >= 2 && companyIds.length <= 5) {
      for (let i = 0; i < companyIds.length; i++) {
        for (let j = i + 1; j < companyIds.length; j++) {
          const key = [companyIds[i], companyIds[j]].sort().join("|");
          if (!seen.has(key)) {
            seen.add(key);
            links.push({ source: companyIds[i], target: companyIds[j], type: "employer", reason: `${emp} alumni` });
          }
        }
      }
    }
  });

  return links;
}

export default function NetworkGraph() {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const simRef = useRef<d3.Simulation<GraphNode, GraphLink> | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const companies = portfolioData.companies as Company[];

  const buildGraph = useCallback(() => {
    if (!svgRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    if (simRef.current) simRef.current.stop();

    const nodes: GraphNode[] = companies.map((c) => ({
      id: c.id,
      name: c.name,
      sector: c.sector,
      fundingM: c.fundingM,
      radius: Math.max(10, Math.pow(c.fundingM, 0.38)),
      company: c,
    }));

    const rawLinks = computeLinks(companies);
    const nodeById = new Map(nodes.map((n) => [n.id, n]));
    const links: GraphLink[] = rawLinks
      .map((l) => ({ ...l, source: nodeById.get(l.source)!, target: nodeById.get(l.target)! }))
      .filter((l) => l.source && l.target);

    const svg = d3.select(svgRef.current).attr("width", width).attr("height", height);
    svg.selectAll("*").remove();

    const defs = svg.append("defs");
    const filter = defs.append("filter").attr("id", "glow").attr("x", "-50%").attr("y", "-50%").attr("width", "200%").attr("height", "200%");
    filter.append("feGaussianBlur").attr("in", "SourceGraphic").attr("stdDeviation", "4").attr("result", "blur");
    const merge = filter.append("feMerge");
    merge.append("feMergeNode").attr("in", "blur");
    merge.append("feMergeNode").attr("in", "SourceGraphic");

    const sectorList = Object.keys(SECTOR_COLORS) as Sector[];
    const sectorCenters: Record<Sector, { x: number; y: number }> = {} as never;
    sectorList.forEach((sector, i) => {
      const angle = (i / sectorList.length) * 2 * Math.PI - Math.PI / 2;
      const rx = width * 0.28;
      const ry = height * 0.28;
      sectorCenters[sector] = {
        x: width / 2 + Math.cos(angle) * rx,
        y: height / 2 + Math.sin(angle) * ry,
      };
    });

    const zoom = d3.zoom<SVGSVGElement, unknown>().scaleExtent([0.25, 4]).on("zoom", (event) => {
      g.attr("transform", event.transform.toString());
    });
    svg.call(zoom);

    const g = svg.append("g");

    const linkSel = g
      .append("g")
      .selectAll<SVGLineElement, GraphLink>("line")
      .data(links)
      .join("line")
      .attr("stroke", "#C9A84C")
      .attr("stroke-opacity", 0.25)
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "3 3");

    const nodeSel = g
      .append("g")
      .selectAll<SVGGElement, GraphNode>("g")
      .data(nodes)
      .join("g")
      .attr("cursor", "pointer")
      .call(
        d3
          .drag<SVGGElement, GraphNode>()
          .on("start", (event, d) => {
            if (!event.active) sim.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on("drag", (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on("end", (event, d) => {
            if (!event.active) sim.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          })
      )
      .on("click", (event, d) => {
        event.stopPropagation();
        setSelectedCompany(d.company);
      })
      .on("mouseenter", (_, d) => setHoveredId(d.id))
      .on("mouseleave", () => setHoveredId(null));

    nodeSel
      .append("circle")
      .attr("r", (d) => d.radius)
      .attr("fill", (d) => SECTOR_COLORS[d.sector])
      .attr("fill-opacity", 0.75)
      .attr("stroke", (d) => SECTOR_COLORS[d.sector])
      .attr("stroke-width", 2)
      .attr("stroke-opacity", 0.9);

    nodeSel
      .append("circle")
      .attr("r", (d) => d.radius + 4)
      .attr("fill", "none")
      .attr("stroke", (d) => SECTOR_COLORS[d.sector])
      .attr("stroke-width", 1)
      .attr("stroke-opacity", 0.3)
      .attr("filter", "url(#glow)");

    nodeSel
      .append("text")
      .text((d) => d.name)
      .attr("text-anchor", "middle")
      .attr("dy", (d) => d.radius + 13)
      .attr("fill", "#E2E8F0")
      .attr("font-size", "9px")
      .attr("font-family", "system-ui, sans-serif")
      .attr("pointer-events", "none");

    const sim = d3
      .forceSimulation(nodes)
      .force("link", d3.forceLink<GraphNode, GraphLink>(links).id((d) => d.id).strength(0.25).distance(80))
      .force("charge", d3.forceManyBody<GraphNode>().strength(-160))
      .force("center", d3.forceCenter(width / 2, height / 2).strength(0.05))
      .force("collide", d3.forceCollide<GraphNode>((d) => d.radius + 12).strength(0.8))
      .force("sector", () => {
        nodes.forEach((n) => {
          const c = sectorCenters[n.sector];
          n.vx = (n.vx ?? 0) + (c.x - (n.x ?? 0)) * 0.018;
          n.vy = (n.vy ?? 0) + (c.y - (n.y ?? 0)) * 0.018;
        });
      });

    simRef.current = sim;

    sim.on("tick", () => {
      linkSel
        .attr("x1", (d) => (d.source as GraphNode).x ?? 0)
        .attr("y1", (d) => (d.source as GraphNode).y ?? 0)
        .attr("x2", (d) => (d.target as GraphNode).x ?? 0)
        .attr("y2", (d) => (d.target as GraphNode).y ?? 0);

      nodeSel.attr("transform", (d) => `translate(${d.x ?? 0},${d.y ?? 0})`);
    });

    svg.on("click", () => setSelectedCompany(null));

    return () => sim.stop();
  }, [companies]);

  useEffect(() => {
    buildGraph();
    const observer = new ResizeObserver(() => buildGraph());
    if (containerRef.current) observer.observe(containerRef.current);
    return () => {
      observer.disconnect();
      simRef.current?.stop();
    };
  }, [buildGraph]);

  useEffect(() => {
    if (!svgRef.current) return;
    d3.select(svgRef.current)
      .selectAll<SVGCircleElement, GraphNode>("circle:first-child")
      .attr("fill-opacity", (d) => (!hoveredId || d.id === hoveredId ? 0.75 : 0.25))
      .attr("stroke-opacity", (d) => (!hoveredId || d.id === hoveredId ? 0.9 : 0.2));
  }, [hoveredId]);

  const sectorList = Object.entries(SECTOR_COLORS) as [Sector, string][];

  return (
    <div ref={containerRef} className="relative w-full h-full">
      <svg ref={svgRef} className="w-full h-full" style={{ background: "#0B1426" }} />

      <div className="absolute top-4 left-4 rounded-xl border border-white/10 p-3 space-y-1.5" style={{ background: "#162035" }}>
        <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-2">Sector</p>
        {sectorList.map(([sector, color]) => (
          <div key={sector} className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: color }} />
            <span className="text-[11px] text-gray-300">{sector}</span>
          </div>
        ))}
        <div className="pt-2 border-t border-white/10">
          <p className="text-[10px] text-gray-500">Node size = funding</p>
          <p className="text-[10px] text-gray-500">Lines = shared alumni</p>
        </div>
      </div>

      <div className="absolute bottom-4 left-4 text-[10px] text-gray-500 space-y-0.5">
        <p>Scroll to zoom. Drag to pan. Click node to expand.</p>
      </div>

      <AnimatePresence>
        {selectedCompany && (
          <motion.div
            key={selectedCompany.id}
            initial={{ opacity: 0, x: 24, scale: 0.97 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 24, scale: 0.97 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="absolute top-4 right-4 rounded-xl border border-[#C9A84C]/30 p-5 w-72 shadow-2xl"
            style={{ background: "#162035" }}
          >
            <button
              onClick={() => setSelectedCompany(null)}
              className="absolute top-3 right-3 text-gray-500 hover:text-white text-sm transition-colors"
            >
              x
            </button>

            <div className="flex items-start gap-2 mb-3">
              <span
                className="mt-1 w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ background: SECTOR_COLORS[selectedCompany.sector] }}
              />
              <div>
                <h3 className="text-white font-semibold text-base leading-tight">{selectedCompany.name}</h3>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  {selectedCompany.sector} · Founded {selectedCompany.founded} · ${selectedCompany.fundingM >= 1000 ? (selectedCompany.fundingM / 1000).toFixed(1) + "B" : selectedCompany.fundingM + "M"} raised
                </p>
              </div>
            </div>

            <p className="text-[12px] text-gray-300 mb-4 leading-relaxed">{selectedCompany.description}</p>

            <div className="space-y-3">
              <p className="text-[10px] uppercase tracking-widest text-[#C9A84C]">Founders</p>
              {selectedCompany.founders.map((f) => (
                <div key={f.name} className="pl-3 border-l border-[#C9A84C]/30">
                  <p className="text-[13px] font-medium text-white">{f.name}</p>
                  <p className="text-[11px] text-gray-400">{f.role}</p>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    <span className="text-gray-400">Prior:</span> {f.priorCompany}
                  </p>
                  <p className="text-[11px] text-gray-500">
                    <span className="text-gray-400">School:</span> {f.university}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-3 pt-3 border-t border-white/10">
              <span
                className="text-[10px] px-2 py-0.5 rounded-full"
                style={{ background: SECTOR_COLORS[selectedCompany.sector] + "22", color: SECTOR_COLORS[selectedCompany.sector] }}
              >
                {selectedCompany.status.charAt(0).toUpperCase() + selectedCompany.status.slice(1)}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
