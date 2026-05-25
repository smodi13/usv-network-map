# USV Portfolio Network Map

An interactive research tool mapping Union Square Ventures' portfolio as a human network. Built by Sahil Modi as part of his USV Analyst Program application.

## What it does

USV's thesis is about large networks of engaged users. This project visualizes that thesis from the inside, mapping the institutional and personal connections that run through the portfolio.

**Three sections:**

1. **Network Graph** - Force-directed D3.js graph of 42 USV portfolio companies. Node size scales with total funding raised. Color represents sector. Gold lines connect companies whose founders share prior employers, surfacing the DoubleClick alumni cluster, the Odeo-to-Twitter lineage, the Wildcard-to-Livepeer thread, and more.

2. **Founder Background Explorer** - Filterable, sortable table of every founder across the portfolio. Columns: name, company, prior employer, university, and a Connection Score counting shared institutional ties with other USV-backed founders. The Harvard cluster (OkCupid, Gilt, Hinge, Remitly), the UPenn cluster (Venmo, Flatiron, Livepeer, Compound), and the Michigan cluster (Twilio, Handshake) all emerge clearly.

3. **About** - Context on why this was built and contact information.

## Tech stack

- Next.js 16 (App Router)
- D3.js for force-directed graph
- Framer Motion for UI animations
- GSAP ScrollTrigger for scroll animations
- Tailwind CSS for layout
- TypeScript throughout

## Data

All portfolio and founder data lives in `data/portfolio.json`. No hardcoded values in component logic. Data compiled from public sources including Crunchbase, PitchBook, LinkedIn, and company websites.

42 companies across 6 sectors: Social, Marketplace, Fintech, Infrastructure, Consumer, Healthcare.

## Running locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Color scheme

| Token | Hex |
|---|---|
| Navy background | `#0B1426` |
| Card background | `#162035` |
| Gold accent | `#C9A84C` |

## Folder structure

```
usv-network-map/
├── app/
│   └── page.tsx
├── components/
│   ├── NetworkGraph.tsx
│   ├── FounderTable.tsx
│   └── AboutSection.tsx
├── data/
│   └── portfolio.json
├── package.json
└── README.md
```

## Contact

Sahil Modi, modi.sahil@gmail.com, (602) 535-7223
