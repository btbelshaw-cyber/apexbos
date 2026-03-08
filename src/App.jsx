import { useState, useRef, useCallback } from "react";

// ════════════════════════════════════════════════════════════════════════════
// RATE LIBRARY
// ════════════════════════════════════════════════════════════════════════════
const REGIONAL_FACTORS = {"Auckland":1.00,"Wellington":1.05,"Christchurch":0.92,"Hamilton":0.94,"Tauranga":0.96,"Dunedin":0.90,"Queenstown":1.18,"Nelson":0.93,"Napier":0.94,"Whangarei":0.97};
const QUALITY_FACTORS = {"budget":0.82,"standard":1.00,"premium":1.28,"luxury":1.65};
const RATE_LIBRARY = [
  {id:"SW003",cat:"Siteworks",el:"Earthworks",trade:"Civil",desc:"Site preparation and trim",unit:"m2",rate:28},
  {id:"SW006",cat:"Siteworks",el:"Drainage",trade:"Civil",desc:"Subsoil drain",unit:"m",rate:185},
  {id:"SW009",cat:"Siteworks",el:"Paving",trade:"Civil",desc:"Concrete driveway 100mm",unit:"m2",rate:145},
  {id:"SW014",cat:"Siteworks",el:"Fencing",trade:"Civil",desc:"Timber paling fence 1.8m",unit:"m",rate:185},
  {id:"ST001",cat:"Structure",el:"Foundations",trade:"Concrete",desc:"Strip foundation concrete",unit:"m",rate:380},
  {id:"ST010",cat:"Structure",el:"Ground Floor",trade:"Concrete",desc:"Concrete slab on ground 100mm",unit:"m2",rate:165},
  {id:"ST012",cat:"Structure",el:"Ground Floor",trade:"Concrete",desc:"Polished concrete slab",unit:"m2",rate:280},
  {id:"ST014",cat:"Structure",el:"Upper Floor",trade:"Concrete",desc:"Suspended concrete slab 200mm",unit:"m2",rate:320},
  {id:"ST020",cat:"Structure",el:"Structural Frame",trade:"Framing",desc:"Timber wall framing NZS3604",unit:"m2",rate:95},
  {id:"ST030",cat:"Structure",el:"Roof Structure",trade:"Framing",desc:"Timber roof trusses",unit:"m2",rate:85},
  {id:"ST031",cat:"Structure",el:"Roof Structure",trade:"Framing",desc:"Cut roof rafters",unit:"m2",rate:120},
  {id:"BE001",cat:"Building Envelope",el:"Roof",trade:"Roofing",desc:"Colorsteel corrugate roofing",unit:"m2",rate:145},
  {id:"BE002",cat:"Building Envelope",el:"Roof",trade:"Roofing",desc:"Colorsteel standing seam",unit:"m2",rate:210},
  {id:"BE003",cat:"Building Envelope",el:"Roof",trade:"Roofing",desc:"Concrete roof tiles",unit:"m2",rate:165},
  {id:"BE005",cat:"Building Envelope",el:"Roof",trade:"Roofing",desc:"Membrane flat roof TPO",unit:"m2",rate:185},
  {id:"BE007",cat:"Building Envelope",el:"Roof",trade:"Roofing",desc:"Skylight fixed",unit:"item",rate:1850},
  {id:"BE008",cat:"Building Envelope",el:"Roof",trade:"Roofing",desc:"Gutters and downpipes",unit:"m",rate:95},
  {id:"BE010",cat:"Building Envelope",el:"External Walls",trade:"Cladding",desc:"Linea weatherboard cladding",unit:"m2",rate:210},
  {id:"BE011",cat:"Building Envelope",el:"External Walls",trade:"Cladding",desc:"Hardiplank weatherboard",unit:"m2",rate:185},
  {id:"BE012",cat:"Building Envelope",el:"External Walls",trade:"Cladding",desc:"Timber weatherboard",unit:"m2",rate:245},
  {id:"BE013",cat:"Building Envelope",el:"External Walls",trade:"Cladding",desc:"Brick veneer cladding",unit:"m2",rate:380},
  {id:"BE014",cat:"Building Envelope",el:"External Walls",trade:"Cladding",desc:"Plaster render EIFS system",unit:"m2",rate:310},
  {id:"BE015",cat:"Building Envelope",el:"External Walls",trade:"Cladding",desc:"Vertical cedar cladding",unit:"m2",rate:420},
  {id:"BE020",cat:"Building Envelope",el:"Windows & Doors",trade:"Joinery",desc:"Aluminium window standard",unit:"m2",rate:1100},
  {id:"BE021",cat:"Building Envelope",el:"Windows & Doors",trade:"Joinery",desc:"Aluminium window thermally broken",unit:"m2",rate:1650},
  {id:"BE023",cat:"Building Envelope",el:"Windows & Doors",trade:"Joinery",desc:"Aluminium sliding door",unit:"m2",rate:1250},
  {id:"BE024",cat:"Building Envelope",el:"Windows & Doors",trade:"Joinery",desc:"Aluminium bi-fold door",unit:"m2",rate:1800},
  {id:"BE025",cat:"Building Envelope",el:"Windows & Doors",trade:"Joinery",desc:"Timber entrance door",unit:"item",rate:3200},
  {id:"BE026",cat:"Building Envelope",el:"Windows & Doors",trade:"Joinery",desc:"Garage door sectional",unit:"item",rate:4500},
  {id:"BE030",cat:"Building Envelope",el:"Insulation",trade:"Insulation",desc:"Wall insulation R2.2 batts",unit:"m2",rate:28},
  {id:"BE031",cat:"Building Envelope",el:"Insulation",trade:"Insulation",desc:"Ceiling insulation R3.6 batts",unit:"m2",rate:22},
  {id:"BE032",cat:"Building Envelope",el:"Insulation",trade:"Insulation",desc:"Underfloor insulation R1.8",unit:"m2",rate:18},
  {id:"FO001",cat:"Fitout",el:"Internal Walls",trade:"Linings",desc:"Plasterboard lining 10mm GIB",unit:"m2",rate:65},
  {id:"FO003",cat:"Fitout",el:"Internal Walls",trade:"Linings",desc:"Wet area lining Hardigroove",unit:"m2",rate:95},
  {id:"FO005",cat:"Fitout",el:"Internal Walls",trade:"Partitions",desc:"Timber stud partition wall",unit:"m2",rate:185},
  {id:"FO010",cat:"Fitout",el:"Ceilings",trade:"Linings",desc:"Plasterboard ceiling flat",unit:"m2",rate:75},
  {id:"FO011",cat:"Fitout",el:"Ceilings",trade:"Linings",desc:"Suspended ceiling tiles",unit:"m2",rate:95},
  {id:"FO012",cat:"Fitout",el:"Ceilings",trade:"Linings",desc:"Timber batten ceiling",unit:"m2",rate:185},
  {id:"FO020",cat:"Fitout",el:"Floor Finishes",trade:"Flooring",desc:"Carpet mid-grade",unit:"m2",rate:75},
  {id:"FO022",cat:"Fitout",el:"Floor Finishes",trade:"Tiling",desc:"Ceramic floor tiles",unit:"m2",rate:130},
  {id:"FO023",cat:"Fitout",el:"Floor Finishes",trade:"Tiling",desc:"Porcelain floor tiles",unit:"m2",rate:185},
  {id:"FO024",cat:"Fitout",el:"Floor Finishes",trade:"Flooring",desc:"Engineered timber flooring",unit:"m2",rate:195},
  {id:"FO025",cat:"Fitout",el:"Floor Finishes",trade:"Flooring",desc:"Solid timber flooring",unit:"m2",rate:285},
  {id:"FO026",cat:"Fitout",el:"Floor Finishes",trade:"Flooring",desc:"Luxury vinyl plank LVP",unit:"m2",rate:85},
  {id:"FO030",cat:"Fitout",el:"Wall Finishes",trade:"Tiling",desc:"Ceramic wall tiles bathroom",unit:"m2",rate:145},
  {id:"FO032",cat:"Fitout",el:"Wall Finishes",trade:"Painting",desc:"Interior painting 2 coat",unit:"m2",rate:18},
  {id:"FO033",cat:"Fitout",el:"Wall Finishes",trade:"Painting",desc:"Exterior painting 2 coat",unit:"m2",rate:25},
  {id:"FO040",cat:"Fitout",el:"Kitchen",trade:"Joinery",desc:"Kitchen fitout standard",unit:"item",rate:15000},
  {id:"FO041",cat:"Fitout",el:"Kitchen",trade:"Joinery",desc:"Kitchen fitout mid-range",unit:"item",rate:25000},
  {id:"FO042",cat:"Fitout",el:"Kitchen",trade:"Joinery",desc:"Kitchen fitout premium",unit:"item",rate:45000},
  {id:"FO043",cat:"Fitout",el:"Bathroom",trade:"Plumbing",desc:"Bathroom fitout standard",unit:"item",rate:10000},
  {id:"FO044",cat:"Fitout",el:"Bathroom",trade:"Plumbing",desc:"Bathroom fitout mid-range",unit:"item",rate:18000},
  {id:"FO045",cat:"Fitout",el:"Bathroom",trade:"Plumbing",desc:"Ensuite fitout standard",unit:"item",rate:8500},
  {id:"FO046",cat:"Fitout",el:"Bathroom",trade:"Plumbing",desc:"Laundry fitout",unit:"item",rate:4500},
  {id:"FO047",cat:"Fitout",el:"Joinery",trade:"Joinery",desc:"Wardrobe built-in",unit:"m",rate:850},
  {id:"FO050",cat:"Fitout",el:"Internal Doors",trade:"Joinery",desc:"Internal door solid core",unit:"item",rate:850},
  {id:"FO051",cat:"Fitout",el:"Internal Doors",trade:"Joinery",desc:"Internal door hollow core",unit:"item",rate:480},
  {id:"FO052",cat:"Fitout",el:"Internal Doors",trade:"Joinery",desc:"Cavity slider door",unit:"item",rate:1250},
  {id:"FO060",cat:"Fitout",el:"Stairs",trade:"Joinery",desc:"Timber stair straight flight",unit:"item",rate:8500},
  {id:"FO061",cat:"Fitout",el:"Stairs",trade:"Steel",desc:"Steel stair with timber treads",unit:"item",rate:14000},
  {id:"SV001",cat:"Services",el:"Plumbing",trade:"Plumbing",desc:"Plumbing installation residential",unit:"m2",rate:110},
  {id:"SV002",cat:"Services",el:"Plumbing",trade:"Plumbing",desc:"Hot water cylinder electric 180L",unit:"item",rate:2800},
  {id:"SV003",cat:"Services",el:"Plumbing",trade:"Plumbing",desc:"Hot water heat pump system",unit:"item",rate:5500},
  {id:"SV010",cat:"Services",el:"Electrical",trade:"Electrical",desc:"Electrical installation residential",unit:"m2",rate:95},
  {id:"SV011",cat:"Services",el:"Electrical",trade:"Electrical",desc:"Electrical installation commercial",unit:"m2",rate:185},
  {id:"SV012",cat:"Services",el:"Electrical",trade:"Electrical",desc:"Main switchboard residential",unit:"item",rate:3500},
  {id:"SV013",cat:"Services",el:"Electrical",trade:"Electrical",desc:"Solar PV system 6kW",unit:"item",rate:14000},
  {id:"SV020",cat:"Services",el:"HVAC",trade:"HVAC",desc:"Heat pump split system",unit:"item",rate:3800},
  {id:"SV021",cat:"Services",el:"HVAC",trade:"HVAC",desc:"Ducted heat pump system",unit:"m2",rate:185},
  {id:"SV022",cat:"Services",el:"HVAC",trade:"HVAC",desc:"Ventilation system HRV/ERV",unit:"item",rate:6500},
  {id:"SV030",cat:"Services",el:"Fire Protection",trade:"Fire",desc:"Sprinkler system residential",unit:"m2",rate:65},
  {id:"SV031",cat:"Services",el:"Fire Protection",trade:"Fire",desc:"Smoke alarm system",unit:"item",rate:280},
];

const CLASSIFY_MAP = [
  {kw:["site prep","earthwork","clearing"],id:"SW003"},{kw:["subsoil drain","ag pipe"],id:"SW006"},
  {kw:["concrete driv","concrete path"],id:"SW009"},{kw:["timber fence","paling fence"],id:"SW014"},
  {kw:["strip foundation","strip footing"],id:"ST001"},
  {kw:["slab on ground","concrete slab ground","ground slab","slab 100"],id:"ST010"},
  {kw:["polished concrete"],id:"ST012"},{kw:["suspended slab","suspended concrete"],id:"ST014"},
  {kw:["timber framing","wall framing","nzs3604"],id:"ST020"},
  {kw:["roof truss","trusses"],id:"ST030"},{kw:["cut roof","rafter"],id:"ST031"},
  {kw:["colorsteel","corrugated roof","metal roof"],id:"BE001"},
  {kw:["standing seam","longrun"],id:"BE002"},{kw:["concrete tile","roof tile"],id:"BE003"},
  {kw:["flat roof","tpo membrane"],id:"BE005"},{kw:["skylight"],id:"BE007"},
  {kw:["gutter","downpipe"],id:"BE008"},
  {kw:["linea","weatherboard cladding"],id:"BE010"},{kw:["hardiplank","hardie plank"],id:"BE011"},
  {kw:["timber weatherboard"],id:"BE012"},{kw:["brick veneer","brickwork"],id:"BE013"},
  {kw:["plaster render","eifs","stucco"],id:"BE014"},{kw:["vertical cedar","cedar slat"],id:"BE015"},
  {kw:["aluminium window standard","al window"],id:"BE020"},
  {kw:["thermally broken","thermal break"],id:"BE021"},
  {kw:["aluminium sliding door"],id:"BE023"},{kw:["bifold","bi-fold"],id:"BE024"},
  {kw:["entrance door","front door"],id:"BE025"},{kw:["garage door","roller door"],id:"BE026"},
  {kw:["wall insul","r2.2"],id:"BE030"},{kw:["ceiling insul","r3.6","roof insulation"],id:"BE031"},
  {kw:["underfloor insul","r1.8"],id:"BE032"},
  {kw:["plasterboard","gib","wall lining"],id:"FO001"},{kw:["hardigroove","wet area lining"],id:"FO003"},
  {kw:["timber stud partition"],id:"FO005"},
  {kw:["plasterboard ceiling","flat ceiling","gib ceiling"],id:"FO010"},
  {kw:["suspended ceiling","ceiling tiles"],id:"FO011"},{kw:["timber batten ceiling"],id:"FO012"},
  {kw:["carpet"],id:"FO020"},{kw:["ceramic floor","ceramic tile floor"],id:"FO022"},
  {kw:["porcelain floor","porcelain tile"],id:"FO023"},
  {kw:["engineered timber","engineered wood floor"],id:"FO024"},
  {kw:["solid timber floor","hardwood floor"],id:"FO025"},{kw:["lvp","luxury vinyl","vinyl plank"],id:"FO026"},
  {kw:["wall tile","ceramic wall tile"],id:"FO030"},
  {kw:["interior paint","internal paint"],id:"FO032"},{kw:["exterior paint","external paint"],id:"FO033"},
  {kw:["kitchen standard","kitchen fitout","kitchen"],id:"FO040"},
  {kw:["kitchen mid"],id:"FO041"},{kw:["kitchen premium"],id:"FO042"},
  {kw:["bathroom fitout","bathroom standard","bathroom"],id:"FO043"},
  {kw:["bathroom mid"],id:"FO044"},{kw:["ensuite"],id:"FO045"},{kw:["laundry"],id:"FO046"},
  {kw:["wardrobe","robe"],id:"FO047"},
  {kw:["internal door solid","solid core"],id:"FO050"},{kw:["hollow core","internal door hollow"],id:"FO051"},
  {kw:["cavity slider","pocket door"],id:"FO052"},
  {kw:["timber stair"],id:"FO060"},{kw:["steel stair"],id:"FO061"},
  {kw:["plumbing install","plumbing fit"],id:"SV001"},
  {kw:["hot water cylinder","hwc"],id:"SV002"},{kw:["heat pump hot water"],id:"SV003"},
  {kw:["electrical install","power install"],id:"SV010"},
  {kw:["electrical commercial"],id:"SV011"},{kw:["switchboard","main board"],id:"SV012"},
  {kw:["solar","pv system"],id:"SV013"},
  {kw:["heat pump split","split system"],id:"SV020"},{kw:["ducted heat pump"],id:"SV021"},
  {kw:["hrv","erv","ventilation system"],id:"SV022"},
  {kw:["sprinkler"],id:"SV030"},{kw:["smoke alarm"],id:"SV031"},
];

// ════════════════════════════════════════════════════════════════════════════
// ENGINE
// ════════════════════════════════════════════════════════════════════════════
function classifyItem(desc) {
  const l = desc.toLowerCase();
  for (const r of CLASSIFY_MAP) {
    if (r.kw.some(k => l.includes(k))) {
      const rt = RATE_LIBRARY.find(x => x.id === r.id);
      if (rt) return { rateId: rt.id, category: rt.cat, element: rt.el, trade: rt.trade, unitRate: rt.rate, matched: true };
    }
  }
  return { matched: false };
}
function normaliseUnit(u = "") { return u.replace("²","2").replace("sqm","m2").replace("lm","m").trim().toLowerCase(); }
function calcContingency(stage, warnCount) {
  const base = {"preliminary":20,"concept":18,"elemental":15,"detailed":10,"tender":5}[stage?.toLowerCase()] || 15;
  const pct = Math.min(base + (warnCount > 4 ? 5 : warnCount > 2 ? 3 : 0), 25);
  return { pct, band: pct >= 18 ? "High" : pct >= 10 ? "Medium" : "Low" };
}
function calcConfidence(items, warnings) {
  const r = items.filter(i => i.matched).length / Math.max(items.length, 1);
  return r >= 0.85 && warnings.length <= 2 ? "High" : r >= 0.60 && warnings.length <= 5 ? "Medium" : "Low";
}
const fmt = n => (n || 0).toLocaleString("en-NZ");
const fmtC = n => "$" + fmt(n);
function groupBy(items, key) {
  return items.reduce((a, i) => { const k = i[key] || "Unclassified"; (a[k] = a[k] || []).push(i); return a; }, {});
}

function parseInput(raw) {
  if (!raw || !raw.trim()) return { meta: {}, quantities: [], assumptions: [], exclusions: [], risks: [] };
  const lines = raw.split("\n").map(l => l.trimEnd()).filter(l => l.trim());
  const meta = {}, quantities = [], assumptions = [], exclusions = [], risks = [];
  let mode = "meta";
  for (const line of lines) {
    const t = line.trim();
    if (t === "quantities:") { mode = "quantities"; continue; }
    if (t === "assumptions:") { mode = "assumptions"; continue; }
    if (t === "exclusions:") { mode = "exclusions"; continue; }
    if (t === "risks:") { mode = "risks"; continue; }
    if (mode === "meta" && t.includes(":")) {
      const idx = t.indexOf(":");
      const k = t.slice(0, idx).trim().toLowerCase().replace(/ /g,"_");
      const v = t.slice(idx+1).trim().replace(/^["']|["']$/g,"");
      if (k) meta[k] = v;
    }
    else if (mode === "quantities") {
      if (t.startsWith("- description:")) {
        quantities.push({ description: t.replace("- description:","").trim().replace(/^["']|["']$/g,""), quantity: 0, unit: "" });
      } else if ((t.startsWith("quantity:") || t.startsWith("  quantity:")) && quantities.length) {
        quantities[quantities.length-1].quantity = parseFloat(t.split(":")[1]) || 0;
      } else if ((t.startsWith("unit:") || t.startsWith("  unit:")) && quantities.length) {
        quantities[quantities.length-1].unit = t.split(":")[1]?.trim().replace(/^["']|["']$/g,"") || "";
      }
    }
    else if (mode === "assumptions" && t.startsWith("-")) assumptions.push(t.replace(/^-\s*/,"").replace(/^["']|["']$/g,""));
    else if (mode === "exclusions" && t.startsWith("-")) exclusions.push(t.replace(/^-\s*/,"").replace(/^["']|["']$/g,""));
    else if (mode === "risks" && t.startsWith("-")) risks.push(t.replace(/^-\s*/,"").replace(/^["']|["']$/g,""));
  }
  return { meta, quantities, assumptions, exclusions, risks };
}


// ════════════════════════════════════════════════════════════════════════════
// SAMPLE DATA
// ════════════════════════════════════════════════════════════════════════════
const SAMPLE_INPUT = `project_name: 14 Pohutukawa Rise - New Residential Dwelling
project_type: Residential New Build
location: Auckland
floor_area_m2: 220
estimate_stage: Preliminary
quality_level: standard
region: Auckland

quantities:
- description: Concrete slab on ground 100mm
  quantity: 220
  unit: m2
- description: Timber wall framing NZS3604
  quantity: 450
  unit: m2
- description: Roof trusses timber
  quantity: 235
  unit: m2
- description: Linea weatherboard cladding
  quantity: 285
  unit: m2
- description: Colorsteel corrugate roofing
  quantity: 235
  unit: m2
- description: Aluminium window standard
  quantity: 42
  unit: m2
- description: Aluminium sliding door
  quantity: 12
  unit: m2
- description: Plasterboard lining 10mm GIB
  quantity: 680
  unit: m2
- description: Plasterboard ceiling flat
  quantity: 220
  unit: m2
- description: Ceiling insulation R3.6 batts
  quantity: 220
  unit: m2
- description: Wall insulation R2.2 batts
  quantity: 450
  unit: m2
- description: Carpet mid-grade bedrooms
  quantity: 95
  unit: m2
- description: Ceramic floor tiles bathrooms
  quantity: 28
  unit: m2
- description: Engineered timber flooring living
  quantity: 97
  unit: m2
- description: Kitchen fitout standard
  quantity: 1
  unit: item
- description: Bathroom fitout standard
  quantity: 2
  unit: item
- description: Ensuite fitout standard
  quantity: 1
  unit: item
- description: Interior painting 2 coat
  quantity: 900
  unit: m2
- description: Electrical installation residential
  quantity: 220
  unit: m2
- description: Plumbing installation residential
  quantity: 220
  unit: m2
- description: Hot water cylinder electric 180L
  quantity: 1
  unit: item
- description: Strip foundation concrete
  quantity: 85
  unit: m
- description: Site preparation and trim
  quantity: 350
  unit: m2
- description: Subsoil drain
  quantity: 65
  unit: m
- description: Internal door solid core
  quantity: 10
  unit: item
- description: Smoke alarm system
  quantity: 6
  unit: item

assumptions:
- Standard residential site — no abnormal ground conditions
- NZS 3604 timber framing throughout
- Single storey construction

exclusions:
- Landscaping and planting
- Driveway and carpark
- Appliances

risks:
- Subsoil conditions not yet confirmed
- Council consent not yet issued`;

const CONTRACT_SYSTEM_PROMPT = (estimateCtx) => `You are the APEXBOS Contract Scanner — a specialist NZ construction contract analyst.

${estimateCtx ? `PROJECT CONTEXT FROM APEXBOS ESTIMATING AGENT:
${estimateCtx}

Use this context to:
- Flag if contract sum differs significantly from the estimate
- Check that payment milestones align with the cashflow profile
- Verify the scope described in the contract matches what was estimated
- Note any commercial discrepancies between estimate and contract
` : ""}

You have deep knowledge of NZS 3910:2023, NZS 3902:2004, Construction Contracts Act 2002, Building Act 2004, and NZ consumer protection law.

Return ONLY valid JSON with this exact structure:
{
  "contract_type": "string",
  "parties": { "principal": "string or null", "contractor": "string or null", "engineer": "string or null" },
  "project": { "description": "string or null", "value": "string or null", "start_date": "string or null", "completion_date": "string or null", "defects_liability_period": "string or null" },
  "payment": { "schedule": "string", "milestones": ["array"], "retention": "string or null", "payment_terms_days": "string or null" },
  "estimate_alignment": ${estimateCtx ? `{
    "contract_value_vs_estimate": "string — compare contract sum to estimate if both available",
    "scope_match": "string — does contract scope match estimated scope",
    "milestone_vs_cashflow": "string — do payment milestones align with cashflow",
    "discrepancies": ["array of notable differences"]
  }` : "null"},
  "risk_flags": [{
    "id": "string",
    "severity": "red | amber | green",
    "clause": "string or null",
    "title": "string",
    "issue": "string",
    "plain_english": "string",
    "recommendation": "string"
  }],
  "key_obligations": { "principal": ["array"], "contractor": ["array"] },
  "summary": "string — 3-5 sentence plain English summary",
  "overall_risk": "low | medium | high | critical",
  "overall_risk_reason": "string",
  "red_count": number,
  "amber_count": number,
  "green_count": number
}

Flag pay-when-paid clauses as RED (illegal in NZ under Construction Contracts Act 2002).
Flag missing insurance, H&S, or indemnity clauses as AMBER.
Flag unusual retention, termination, or variation clauses.`;

// ════════════════════════════════════════════════════════════════════════════
// SHARED COMPONENTS
// ════════════════════════════════════════════════════════════════════════════
const GOLD = "#d4a843";
const DK = "#080b0f";

function DocHeader({ title, sub, meta, runId, badge, badgeColor }) {
  return (
    <div style={{ borderBottom: `2px solid ${GOLD}`, paddingBottom: 16, marginBottom: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 26, letterSpacing: 3, color: GOLD }}>{title}</div>
          {sub && <div style={{ fontSize: 14, color: "#c8c0b0", marginTop: 4 }}>{sub}</div>}
          {meta && <div style={{ fontSize: 10, color: "#5a6070", marginTop: 4, letterSpacing: 1 }}>{meta}</div>}
        </div>
        <div style={{ textAlign: "right" }}>
          {runId && <><div style={{ fontSize: 8, letterSpacing: 2, color: "#3a4050" }}>RUN ID</div><div style={{ fontSize: 10, color: "#4a5060", marginBottom: 6 }}>{runId}</div></>}
          {badge && <div style={{ display: "inline-block", padding: "4px 12px", background: badgeColor + "15", border: `1px solid ${badgeColor}50`, color: badgeColor, fontSize: 10, letterSpacing: 2 }}>{badge}</div>}
        </div>
      </div>
    </div>
  );
}

function CostRow({ label, value, bold, indent, sub }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 16px", background: bold ? "#0f1318" : "transparent", borderBottom: "1px solid #0a0c10", borderTop: bold ? `1px solid ${GOLD}40` : "none" }}>
      <div>
        <span style={{ fontSize: 11, letterSpacing: 0.5, color: bold ? GOLD : "#8a90a0", paddingLeft: indent ? 16 : 0 }}>{label}</span>
        {sub && <div style={{ fontSize: 9, color: "#3a4050", paddingLeft: indent ? 16 : 0, marginTop: 2 }}>{sub}</div>}
      </div>
      <span style={{ fontSize: bold ? 14 : 12, color: bold ? GOLD : "#c8c0b0", fontWeight: bold ? 500 : 400 }}>{fmtC(value)}</span>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// MAIN APP
// ════════════════════════════════════════════════════════════════════════════
const TOOLS = [
  { id: "estimator", label: "Estimating Agent", icon: "◈", desc: "Quantity schedule → Cost estimate" },
  { id: "scanner", label: "Contract Scanner", icon: "⊟", desc: "Contract upload → Risk analysis" },
];

export default function App() {
  const [activeTool, setActiveTool] = useState("estimator");
  const [project, setProject] = useState(null); // shared project context

  return (
    <div style={{ fontFamily: "'DM Mono','Courier New',monospace", background: DK, minHeight: "100vh", color: "#ddd8cc" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Bebas+Neue&display=swap');
        *{box-sizing:border-box}
        ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-thumb{background:#2a3040;border-radius:2px}
        .btn{cursor:pointer;border:none;outline:none;transition:all 0.18s;font-family:'DM Mono',monospace}
        .btn:hover{opacity:0.82}
        .tool-tab{cursor:pointer;transition:all 0.2s;border:none;outline:none;font-family:'DM Mono',monospace}
        .flag-card{transition:transform 0.15s} .flag-card:hover{transform:translateX(3px)}
        @keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        .fade-in{animation:fadeIn 0.35s ease forwards}
        @keyframes scan{0%{top:0%}100%{top:100%}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}
        .pulse{animation:pulse 1.4s infinite}
        tr:hover td{background:#0d1014!important}
        select option{background:#0d1016}

        @media print {
          @page { margin: 18mm 16mm; size: A4; }
          body { background: #fff !important; color: #111 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          .print-doc { background: #fff !important; color: #111 !important; padding: 0 !important; }
          .print-doc * { color: inherit !important; border-color: #ccc !important; background: transparent !important; font-family: 'DM Mono', monospace !important; }
          .print-doc .print-doc-title { color: #1a1a2e !important; border-bottom: 2px solid #1a1a2e !important; }
          .print-doc .print-doc-gold { color: #b8902a !important; }
          .print-doc .print-doc-green { color: #2a6a3a !important; }
          .print-doc .print-doc-red { color: #8a2020 !important; }
          .print-doc .print-doc-amber { color: #8a5a10 !important; }
          .print-doc table { border-collapse: collapse !important; width: 100% !important; }
          .print-doc th { border-bottom: 1px solid #999 !important; color: #333 !important; font-size: 8pt !important; }
          .print-doc td { border-bottom: 1px solid #e8e8e8 !important; font-size: 9pt !important; color: #111 !important; }
          .print-doc .cost-row-bold td, .print-doc .cost-row-bold { background: #f5f5f0 !important; border-top: 1px solid #888 !important; }
          .print-doc .section-header { color: #333 !important; border-bottom: 1px solid #888 !important; font-size: 8pt !important; letter-spacing: 2px !important; }
          .print-doc .trade-banner { background: #f0f0f0 !important; color: #333 !important; }
          .print-doc .aer-box { border: 1px solid #ccc !important; }
          .print-doc .aer-title-assumptions { color: #2a6a3a !important; }
          .print-doc .aer-title-exclusions { color: #8a2020 !important; }
          .print-doc .aer-title-risks { color: #8a5a10 !important; }
          .print-doc .warn-text { color: #8a5a10 !important; }
          .print-doc .cashflow-bar { background: #ddd !important; }
          .print-doc .cashflow-fill { background: #b8902a !important; opacity: 1 !important; }
          .apexbos-global-header, .apexbos-tool-tabs, .apexbos-subtabs, .apexbos-sidebar { display: none !important; }
          .print-doc-wrapper { display: block !important; padding: 0 !important; }
          tr:hover td { background: transparent !important; }
        }
      `}</style>

      {/* ── GLOBAL HEADER ── */}
      <div style={{ borderBottom: "1px solid #1a2030" }} className="apexbos-global-header no-print">
        <div style={{ padding: "0 28px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 56 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 36, height: 36, background: GOLD, clipPath: "polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: DK }}>AX</div>
            <div>
              <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 19, letterSpacing: 3, color: GOLD, lineHeight: 1 }}>APEXBOS</div>
              <div style={{ fontSize: 7.5, letterSpacing: 4, color: "#3a4050" }}>NZ CONSTRUCTION AI SUITE</div>
            </div>
          </div>
          {/* Project badge */}
          {project && (
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 14px", border: "1px solid #1e2530", background: "#0a0d12" }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#5aaa6a" }} />
              <div>
                <div style={{ fontSize: 10, color: "#8a9090" }}>{project.name}</div>
                <div style={{ fontSize: 9, color: "#3a4050" }}>{project.type} · {fmtC(project.totalExGst)} · {project.floorArea}m²</div>
              </div>
            </div>
          )}
        </div>
        {/* Tool tabs */}
        <div style={{ display: "flex", padding: "0 28px" }}>
          {TOOLS.map(t => (
            <button key={t.id} className="tool-tab" onClick={() => setActiveTool(t.id)} style={{ padding: "10px 24px", color: activeTool === t.id ? GOLD : "#3a4050", borderBottom: activeTool === t.id ? `2px solid ${GOLD}` : "2px solid transparent", fontSize: 9, letterSpacing: 3, background: "transparent", textTransform: "uppercase", display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 14, opacity: activeTool === t.id ? 1 : 0.4 }}>{t.icon}</span>
              {t.label}
              {t.id === "scanner" && project && <span style={{ fontSize: 8, padding: "1px 6px", background: "#1a3020", color: "#5aaa6a", border: "1px solid #2a4030" }}>CONTEXT LOADED</span>}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: "24px 28px" }}>
        {activeTool === "estimator" && <EstimatingAgent onEstimateComplete={setProject} existingProject={project} />}
        {activeTool === "scanner" && <ContractScanner project={project} />}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// ESTIMATING AGENT
// ════════════════════════════════════════════════════════════════════════════
function EstimatingAgent({ onEstimateComplete, existingProject }) {
  const [tab, setTab] = useState("input");
  const [inputText, setInputText] = useState(SAMPLE_INPUT);
  const [outputTypeId, setOutputTypeId] = useState("preliminary");
  const [applyGst, setApplyGst] = useState(false);
  const [cfg, setCfg] = useState({ prelims: 0.08, overhead: 0.08, profit: 0.06 });
  const [running, setRunning] = useState(false);
  const [currentStage, setCurrentStage] = useState(-1);
  const [stageLog, setStageLog] = useState([]);
  const [result, setResult] = useState(null);
  const [docxFileName, setDocxFileName] = useState("");
  const [docxDragging, setDocxDragging] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [extractError, setExtractError] = useState("");
  const docxInputRef = useRef(null);

  async function handleDocxUpload(file) {
    setExtractError("");
    setDocxFileName(file.name);
    setExtracting(true);
    try {
      // Read docx as arraybuffer and extract text via mammoth
      const mammoth = await import("mammoth");
      const arrayBuffer = await file.arrayBuffer();
      const { value: docText } = await mammoth.extractRawText({ arrayBuffer });

      // Send to Claude to convert to YAML input pack
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": "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", "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 2000,
          system: `You are a NZ quantity surveyor assistant. Convert the provided quantity takeoff / schedule document into a YAML input pack for the APEXBOS Estimating Agent.

Output ONLY valid YAML — no explanation, no markdown fences, no preamble.

The YAML must follow this exact structure:
project_name: "string"
project_type: "residential|commercial|civil|fitout|industrial"
location: "city, NZ"
floor_area_m2: number
estimate_stage: "Concept|Preliminary|Developed Design|Consent|Tender|Construction"
quality_level: "budget|standard|premium|luxury"
region: "Auckland|Wellington|Christchurch|Queenstown|Dunedin|Hamilton|Tauranga|Napier|Nelson|Palmerston North"
quantities:
  - description: "item description"
    quantity: number
    unit: "m2|m3|lm|nr|t|kg|ls"
assumptions:
  - "assumption text"
exclusions:
  - "exclusion text"
risks:
  - "risk text"

Extract all quantity items from the document. Where quantities are not explicitly stated, use reasonable NZ construction estimates based on the floor area and project type. Map elements to the closest matching description.`,
          messages: [{ role: "user", content: `Convert this quantity schedule to YAML:\n\n${docText}` }]
        })
      });
      const data = await response.json();
      const yaml = data.content?.map(b => b.text || "").join("").trim();
      setInputText(yaml);
    } catch (err) {
      setExtractError("Could not read document: " + err.message);
      setDocxFileName("");
      setExtracting(false);
      return;
    }
    setExtracting(false);
  }

  const OUTPUT_TYPES = [
    { id: "preliminary", label: "Preliminary Estimate",    desc: "Cost by category" },
    { id: "elemental",   label: "Elemental Cost Plan",     desc: "NZIQS elemental breakdown" },
    { id: "concept",     label: "Concept Cost Plan",       desc: "Elemental with $/m²" },
    { id: "trade",       label: "Trade Package Estimate",  desc: "By trade with % split" },
    { id: "boq",         label: "Bill of Quantities",      desc: "Formal with item codes" },
    { id: "detailed",    label: "Detailed Quantity Est.",  desc: "Full line items" },
    { id: "schedule",    label: "Schedule of Quantities",  desc: "Qty only — no rates" },
    { id: "feasibility", label: "Feasibility Estimate",    desc: "Low / central / high range" },
    { id: "procurement", label: "Procurement Estimate",    desc: "Trade packages for tender" },
    { id: "cashflow",    label: "Cashflow Estimate",       desc: "12-month spend profile" },
    { id: "materials",   label: "Materials Take-off",      desc: "Quantities by material" },
  ];
  const STAGE_LABELS = ["Receive Job","Validate Input","Build Data Model","Normalise Quantities","Classify Items","Match Rates","Calculate Base Costs","Apply Adjustments","Apply Preliminaries","Overhead & Profit","Contingency Engine","Assemble Estimate","Format Output","Store Benchmark","Return Result"];

  async function runEstimate() {
    setRunning(true); setResult(null); setStageLog([]); setTab("pipeline");
    const log = []; const delay = ms => new Promise(r => setTimeout(r, ms));
    const { meta, quantities, assumptions, exclusions, risks } = parseInput(inputText);

    setCurrentStage(0); await delay(320);
    const runId = "APX-" + Date.now().toString(36).toUpperCase();
    log.push({ stage: 0, status: "ok", msg: `${runId} | ${meta.project_name || "Unnamed"}` }); setStageLog([...log]);

    setCurrentStage(1); await delay(400);
    const errors = [], warnings = [];
    if (!meta.project_name) errors.push("project_name missing");
    if (!quantities.length) errors.push("No quantities provided");
    quantities.forEach((q, i) => { if (!q.unit) warnings.push(`Item ${i+1} "${q.description}" — unit missing`); });
    if (errors.length) { log.push({ stage: 1, status: "error", msg: errors.join("; ") }); setStageLog([...log]); setRunning(false); setResult({ success: false, errors }); setTab("result"); return; }
    log.push({ stage: 1, status: "ok", msg: `${quantities.length} items, ${warnings.length} warning(s)` }); setStageLog([...log]);

    setCurrentStage(2); await delay(300);
    log.push({ stage: 2, status: "ok", msg: `${assumptions.length} assumptions, ${exclusions.length} exclusions, ${risks.length} risks` }); setStageLog([...log]);

    setCurrentStage(3); await delay(300);
    const normItems = quantities.map((q, i) => ({ id: i, originalDescription: q.description, description: q.description.trim(), quantity: q.quantity || 0, unit: normaliseUnit(q.unit) }));
    log.push({ stage: 3, status: "ok", msg: `${normItems.length} items normalised` }); setStageLog([...log]);

    setCurrentStage(4); await delay(380);
    const classified = normItems.map(item => { const cls = classifyItem(item.description); if (!cls.matched) warnings.push(`"${item.description}" — unclassified`); return { ...item, ...cls }; });
    const unresolved = classified.filter(i => !i.matched).length;
    log.push({ stage: 4, status: unresolved ? "warn" : "ok", msg: `${classified.length - unresolved} classified, ${unresolved} unresolved` }); setStageLog([...log]);

    setCurrentStage(5); await delay(350);
    const regionFactor = REGIONAL_FACTORS[meta.region] || 1.0;
    const qualFactor = QUALITY_FACTORS[meta.quality_level] || 1.0;
    log.push({ stage: 5, status: "ok", msg: `${classified.filter(i => i.matched).length} matched | ${meta.region||"Auckland"} ×${regionFactor} | ${meta.quality_level||"standard"} ×${qualFactor}` }); setStageLog([...log]);

    setCurrentStage(6); await delay(350);
    const priced = classified.map(item => ({ ...item, adjustedRate: item.unitRate ? Math.round(item.unitRate * regionFactor * qualFactor) : null, itemCost: item.unitRate ? Math.round(item.quantity * item.unitRate * regionFactor * qualFactor) : null }));
    const directCost = priced.reduce((s, i) => s + (i.itemCost || 0), 0);
    log.push({ stage: 6, status: "ok", msg: `Direct cost: ${fmtC(directCost)}` }); setStageLog([...log]);

    setCurrentStage(7); await delay(250);
    log.push({ stage: 7, status: "ok", msg: `Regional ×${regionFactor}, quality ×${qualFactor} applied` }); setStageLog([...log]);

    setCurrentStage(8); await delay(300);
    const prelims = Math.round(directCost * cfg.prelims);
    log.push({ stage: 8, status: "ok", msg: `Preliminaries ${(cfg.prelims*100).toFixed(0)}%: ${fmtC(prelims)}` }); setStageLog([...log]);

    setCurrentStage(9); await delay(300);
    const base2 = directCost + prelims;
    const overhead = Math.round(base2 * cfg.overhead);
    const profit = Math.round((base2 + overhead) * cfg.profit);
    log.push({ stage: 9, status: "ok", msg: `OH ${fmtC(overhead)} | Profit ${fmtC(profit)}` }); setStageLog([...log]);

    setCurrentStage(10); await delay(380);
    const cont = calcContingency(meta.estimate_stage, warnings);
    const base3 = directCost + prelims + overhead + profit;
    const contingency = Math.round(base3 * (cont.pct / 100));
    log.push({ stage: 10, status: "ok", msg: `Contingency ${cont.pct}% (${cont.band}): ${fmtC(contingency)}` }); setStageLog([...log]);

    setCurrentStage(11); await delay(300);
    const totalExGst = base3 + contingency;
    const gst = applyGst ? Math.round(totalExGst * 0.15) : 0;
    const totalIncGst = totalExGst + gst;
    const floorArea = parseFloat(meta.floor_area_m2) || 1;
    const costPerM2 = Math.round(totalExGst / floorArea);
    log.push({ stage: 11, status: "ok", msg: `Total: ${fmtC(totalExGst)} | ${fmtC(costPerM2)}/m²` }); setStageLog([...log]);

    setCurrentStage(12); await delay(280); log.push({ stage: 12, status: "ok", msg: `Formatted as "${OUTPUT_TYPES.find(o=>o.id===outputTypeId)?.label}"` }); setStageLog([...log]);
    setCurrentStage(13); await delay(240); log.push({ stage: 13, status: "ok", msg: `Benchmark: ${meta.project_type}, ${fmtC(costPerM2)}/m²` }); setStageLog([...log]);
    setCurrentStage(14); await delay(280);
    const confidence = calcConfidence(priced, warnings);
    log.push({ stage: 14, status: "ok", msg: `Complete — Confidence: ${confidence}` }); setStageLog([...log]);

    const res = { success: true, runId, meta, outputTypeId, directCost, prelims, overhead, profit, contingency, cont, totalExGst, gst, totalIncGst, costPerM2, floorArea, confidence, warnings, assumptions, exclusions, risks, items: priced, applyGst, cfg };
    setResult(res);

    // Share project context with suite
    onEstimateComplete({
      name: meta.project_name,
      type: meta.project_type,
      location: meta.location,
      floorArea,
      totalExGst,
      costPerM2,
      directCost,
      prelims,
      overhead,
      profit,
      contingency,
      contPct: cont.pct,
      cashflowProfile: [2,3,5,8,10,12,13,13,12,10,7,5],
      assumptions,
      exclusions,
      stage: meta.estimate_stage,
      confidence,
      runId,
    });

    setRunning(false);
    setTimeout(() => setTab("result"), 500);
  }

  return (
    <div className="fade-in">
      {/* Sub-tabs */}
      <div style={{ display: "flex", gap: 0, borderBottom: "1px solid #1e2530", marginBottom: 20 }} className="apexbos-subtabs no-print">
        {["input", "pipeline", "result"].map(t => (
          <button key={t} className="btn" onClick={() => setTab(t)} style={{ padding: "8px 18px", background: tab === t ? "#0d1016" : "transparent", color: tab === t ? GOLD : "#3a4050", borderBottom: tab === t ? `2px solid ${GOLD}` : "2px solid transparent", fontSize: 9, letterSpacing: 2, textTransform: "uppercase" }}>{t}</button>
        ))}
      </div>

      {tab === "input" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 260px", gap: 20, maxWidth: 1050 }}>
          <div>
            {/* ── DOCX UPLOAD ZONE ── */}
            <div style={{ fontSize: 9, letterSpacing: 3, color: "#5a6070", marginBottom: 8 }}>UPLOAD APEXBOS QUANTITY SCHEDULE</div>
            <div
              onDrop={e => { e.preventDefault(); setDocxDragging(false); const f = e.dataTransfer.files[0]; if (f) handleDocxUpload(f); }}
              onDragOver={e => { e.preventDefault(); setDocxDragging(true); }}
              onDragLeave={() => setDocxDragging(false)}
              onClick={() => docxInputRef.current?.click()}
              style={{ border: `2px dashed ${docxDragging ? GOLD : "#1e2a3a"}`, padding: "28px 24px", textAlign: "center", cursor: "pointer", background: docxDragging ? "#0d1520" : "#090c10", marginBottom: 14, transition: "all 0.2s", position: "relative" }}>
              {extracting ? (
                <div>
                  <div style={{ fontSize: 11, color: GOLD, marginBottom: 6 }}>Reading document...</div>
                  <div style={{ fontSize: 10, color: "#5a6070" }}>Claude is extracting quantities from your schedule</div>
                  <div style={{ height: 2, background: "#1a2030", borderRadius: 2, overflow: "hidden", marginTop: 14, maxWidth: 280, margin: "14px auto 0" }}>
                    <div style={{ height: "100%", background: GOLD, width: "60%", animation: "scan 1.2s ease-in-out infinite alternate" }} />
                  </div>
                </div>
              ) : docxFileName ? (
                <div>
                  <div style={{ fontSize: 12, color: "#5aaa6a", marginBottom: 4 }}>✓ {docxFileName}</div>
                  <div style={{ fontSize: 10, color: "#3a5030" }}>Quantities extracted — review below then run estimate</div>
                  <div style={{ fontSize: 9, color: "#2a3040", marginTop: 8, cursor: "pointer" }} onClick={e => { e.stopPropagation(); setDocxFileName(""); setInputText(SAMPLE_INPUT); }}>× Clear and use manual input</div>
                </div>
              ) : (
                <div>
                  <div style={{ fontSize: 22, marginBottom: 8, opacity: 0.3 }}>📄</div>
                  <div style={{ fontSize: 12, color: "#8a90a0", marginBottom: 4 }}>Drop your APEXBOS Quantity Schedule here</div>
                  <div style={{ fontSize: 9, color: "#3a4050", letterSpacing: 2 }}>DOCX files from apexbos.cloud/app.html</div>
                </div>
              )}
              <input ref={docxInputRef} type="file" accept=".docx,.doc" onChange={e => e.target.files[0] && handleDocxUpload(e.target.files[0])} style={{ display: "none" }} />
            </div>
            {extractError && <div style={{ padding: "8px 12px", border: "1px solid #603030", color: "#e07070", fontSize: 10, marginBottom: 10 }}>⚠ {extractError}</div>}

            {/* ── YAML PREVIEW / MANUAL INPUT ── */}
            <div style={{ fontSize: 9, letterSpacing: 3, color: "#5a6070", marginBottom: 8 }}>
              {docxFileName ? "EXTRACTED INPUT — REVIEW & EDIT" : "OR ENTER MANUALLY — YAML"}
            </div>
            <textarea value={inputText} onChange={e => setInputText(e.target.value)} rows={28} style={{ width: "100%", background: "#090c10", border: `1px solid ${docxFileName ? "#2a4030" : "#1e2530"}`, color: "#a8c4a0", padding: 14, fontSize: 11.5, lineHeight: 1.75, fontFamily: "'DM Mono',monospace", outline: "none" }} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ border: "1px solid #1e2530", padding: 14 }}>
              <div style={{ fontSize: 9, letterSpacing: 3, color: "#5a6070", marginBottom: 10 }}>CONFIG</div>
              {[["Prelims %", "prelims"], ["Overhead %", "overhead"], ["Profit %", "profit"]].map(([lbl, key]) => (
                <div key={key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span style={{ fontSize: 10, color: "#5a6070" }}>{lbl}</span>
                  <input type="number" value={(cfg[key]*100).toFixed(0)} min={0} max={30} onChange={e => setCfg(c => ({ ...c, [key]: parseFloat(e.target.value)/100 || 0 }))} style={{ width: 48, background: "#0a0c0e", border: "1px solid #2a3040", color: "#e8e4da", padding: "3px 6px", fontSize: 11, fontFamily: "'DM Mono',monospace", textAlign: "right", outline: "none" }} />
                </div>
              ))}
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8, paddingTop: 8, borderTop: "1px solid #1a1e24" }}>
                <input type="checkbox" checked={applyGst} onChange={e => setApplyGst(e.target.checked)} style={{ accentColor: GOLD }} />
                <span style={{ fontSize: 10, color: "#5a6070" }}>Include GST (15%)</span>
              </div>
            </div>
            <button className="btn" onClick={runEstimate} disabled={running} style={{ background: "#1e2530", color: GOLD, padding: 14, fontSize: 10, letterSpacing: 4, border: `1px solid ${GOLD}`, opacity: running ? 0.5 : 1, cursor: running ? "not-allowed" : "pointer" }}>
              {running ? "PROCESSING..." : "▶  RUN ESTIMATE"}
            </button>
          </div>
        </div>
      )}

      {tab === "pipeline" && (
        <div style={{ maxWidth: 640 }}>
          {STAGE_LABELS.map((label, i) => {
            const log = stageLog.find(l => l.stage === i);
            const isActive = currentStage === i && running;
            const isDone = !!log;
            return (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 14, padding: "10px 0", borderBottom: "1px solid #0f1318", opacity: !isDone && currentStage < i ? 0.22 : 1, transition: "opacity 0.3s" }}>
                <div style={{ width: 22, textAlign: "right", flexShrink: 0 }}><span style={{ fontSize: 9, color: "#3a4050" }}>{String(i+1).padStart(2,"0")}</span></div>
                <div style={{ width: 17, height: 17, borderRadius: "50%", flexShrink: 0, marginTop: 1, background: isDone ? (log?.status === "error" ? "#c04040" : log?.status === "warn" ? "#a07030" : "#406040") : (isActive ? GOLD : "#1a1e24"), display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8 }}>
                  {isActive && <span className="pulse" style={{ width: 6, height: 6, borderRadius: "50%", background: DK, display: "block" }} />}
                  {isDone && !isActive && (log?.status === "error" ? "✕" : log?.status === "warn" ? "!" : "✓")}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, color: isDone ? "#ddd8cc" : isActive ? GOLD : "#3a4050" }}>{label}</div>
                  {log && <div style={{ fontSize: 10, color: "#5a6070", marginTop: 3, lineHeight: 1.5 }}>{log.msg}</div>}
                </div>
              </div>
            );
          })}
          {!running && result?.success && (
            <button className="btn" onClick={() => setTab("result")} style={{ background: GOLD, color: DK, padding: "10px 22px", fontSize: 9, letterSpacing: 3, border: "none", marginTop: 20 }}>VIEW ESTIMATE →</button>
          )}
        </div>
      )}

      {tab === "result" && result && (
        <div>
          {!result.success ? (
            <div style={{ border: "1px solid #603030", padding: 20, color: "#c07070", maxWidth: 600 }}>
              {result.errors.map((e, i) => <div key={i} style={{ marginBottom: 6 }}>✕ {e}</div>)}
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 0, maxWidth: 1100 }}>

              {/* ── DOCUMENT SWITCHER SIDEBAR ── */}
              <div style={{ borderRight: "1px solid #1e2530", paddingRight: 16, paddingTop: 4 }} className="apexbos-sidebar no-print">
                <div style={{ fontSize: 8, letterSpacing: 3, color: "#3a4050", marginBottom: 12, paddingLeft: 4 }}>DOCUMENT TYPE</div>
                {OUTPUT_TYPES.map(o => {
                  const active = outputTypeId === o.id;
                  return (
                    <div key={o.id} onClick={() => setOutputTypeId(o.id)}
                      style={{ padding: "8px 10px", marginBottom: 1, cursor: "pointer", borderLeft: `2px solid ${active ? GOLD : "transparent"}`, background: active ? "#0d1016" : "transparent", transition: "all 0.15s" }}>
                      <div style={{ fontSize: 10, color: active ? GOLD : "#6a7080", lineHeight: 1.3 }}>{o.label}</div>
                      <div style={{ fontSize: 8, color: active ? "#5a6040" : "#2a3040", marginTop: 1 }}>{o.desc}</div>
                    </div>
                  );
                })}

                {/* mini summary */}
                <div style={{ marginTop: 20, padding: "12px 10px", borderTop: "1px solid #1e2530" }}>
                  <div style={{ fontSize: 8, letterSpacing: 2, color: "#3a4050", marginBottom: 10 }}>PROJECT TOTALS</div>
                  {[
                    ["Ex GST", fmtC(result.totalExGst)],
                    ["/m²", fmtC(result.costPerM2)],
                    ["Cont.", `${result.cont?.pct||0}%`],
                  ].map(([l, v]) => (
                    <div key={l} style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ fontSize: 9, color: "#3a4050" }}>{l}</span>
                      <span style={{ fontSize: 9, color: "#7a8090" }}>{v}</span>
                    </div>
                  ))}
                  <div style={{ marginTop: 10 }}>
                    <div style={{ fontSize: 8, letterSpacing: 1, color: "#3a4050", marginBottom: 4 }}>CONFIDENCE</div>
                    <div style={{ fontSize: 10, color: result.confidence==="High"?"#5aaa6a":result.confidence==="Medium"?"#d4943a":"#e05050" }}>{result.confidence}</div>
                  </div>
                </div>

                <div style={{ padding: "12px 10px", borderTop: "1px solid #1e2530" }}>
                  <button className="btn" onClick={() => setTab("input")} style={{ width: "100%", padding: "8px", background: "transparent", border: "1px solid #2a3040", color: "#4a5060", fontSize: 8, letterSpacing: 2 }}>← EDIT INPUT</button>
                </div>
              </div>

              {/* ── DOCUMENT BODY ── */}
              <div style={{ paddingLeft: 24, minWidth: 0 }} className="fade-in print-doc-wrapper" key={outputTypeId}>

                {/* Header */}
                <div className="print-doc" style={{ borderBottom: `2px solid ${GOLD}`, paddingBottom: 14, marginBottom: 20 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10 }}>
                    <div>
                      <div className="print-doc-title" style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 22, letterSpacing: 3, color: GOLD }}>{OUTPUT_TYPES.find(o=>o.id===outputTypeId)?.label.toUpperCase()}</div>
                      <div style={{ fontSize: 13, color: "#c8c0b0", marginTop: 3 }}>{result.meta.project_name}</div>
                      <div style={{ fontSize: 9, color: "#5a6070", marginTop: 3, letterSpacing: 1 }}>{result.meta.location} · {result.meta.project_type} · {fmt(result.floorArea)}m² · {result.meta.estimate_stage}</div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
                      <div style={{ fontSize: 9, color: "#3a4050", letterSpacing: 1 }}>{result.runId}</div>
                      <div style={{ padding: "3px 10px", display: "inline-block", background: result.confidence==="High"?"#1a3020":result.confidence==="Medium"?"#2a2010":"#2a1010", border: `1px solid ${result.confidence==="High"?"#406040":result.confidence==="Medium"?"#807030":"#804040"}`, color: result.confidence==="High"?"#60c080":result.confidence==="Medium"?"#c0a040":"#c06060", fontSize: 9, letterSpacing: 2 }}>{result.confidence} CONFIDENCE</div>
                      {/* Print button */}
                      <button className="btn no-print" onClick={() => window.print()} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", background: "#0d1016", border: `1px solid ${GOLD}60`, color: GOLD, fontSize: 9, letterSpacing: 2 }}>
                        <span style={{ fontSize: 13 }}>⎙</span> PRINT / SAVE PDF
                      </button>
                    </div>
                  </div>
                </div>

                {/* Render document body based on selected type */}
                <div className="print-doc">
                  <EstimateDocumentBody result={result} outputTypeId={outputTypeId} />
                </div>

                {/* Footer */}
                <div className="print-doc" style={{ paddingTop: 14, borderTop: "1px solid #1e2530", marginTop: 8, fontSize: 9, color: "#2a3040", display: "flex", justifyContent: "space-between" }}>
                  <span>APEXBOS Estimating Agent · NZ QS Standard · {new Date().toLocaleDateString("en-NZ")}</span>
                  <span className="no-print">Context saved → Contract Scanner</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// DOCUMENT BODY RENDERER — switches instantly, no re-run needed
// ════════════════════════════════════════════════════════════════════════════
function EstimateDocumentBody({ result, outputTypeId }) {
  const r = result;
  const byGroup = (key) => r.items.filter(i => i.itemCost).reduce((a, i) => { const k = i[key] || "Unclassified"; (a[k] = a[k] || []); a[k].push(i); return a; }, {});

  const CommSummary = () => (
    <div style={{ border: "1px solid #1e2530", marginBottom: 20 }}>
      {[
        ["Direct Construction Cost", r.directCost],
        [`Preliminaries (${((r.cfg?.prelims||0.08)*100).toFixed(0)}%)`, r.prelims],
        [`Contractor Overhead (${((r.cfg?.overhead||0.08)*100).toFixed(0)}%)`, r.overhead],
        [`Contractor Profit (${((r.cfg?.profit||0.06)*100).toFixed(0)}%)`, r.profit],
        [`Contingency (${r.cont?.pct||0}% — ${r.cont?.band||""} Risk)`, r.contingency],
      ].map(([l,v]) => <CostRow key={l} label={l} value={v} />)}
      <CostRow label="TOTAL CONSTRUCTION COST (EX GST)" value={r.totalExGst} bold />
      {r.applyGst && <><CostRow label="GST (15%)" value={r.gst} /><CostRow label="TOTAL INC GST" value={r.totalIncGst} bold /></>}
      <div style={{ display:"flex", justifyContent:"space-between", padding:"9px 16px", background:"#0a0c10", borderTop:`1px solid ${GOLD}30` }}>
        <span style={{ fontSize:12, color:"#8a9aaa", letterSpacing:1 }}>COST PER m² GFA</span>
        <span style={{ fontSize:14, color:"#a8b0b8" }}>{fmtC(r.costPerM2)}/m²</span>
      </div>
    </div>
  );

  const AER = () => (
    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, marginBottom:16 }}>
      {[["ASSUMPTIONS",r.assumptions,"#406040"],["EXCLUSIONS",r.exclusions,"#604040"],["RISKS",r.risks,"#604020"]].map(([lbl,items,col]) => (
        <div key={lbl} style={{ border:`1px solid ${col}30`, padding:12 }}>
          <div style={{ fontSize:11, letterSpacing:3, color:col === "#406040" ? "#6ad08a" : col === "#604040" ? "#e07070" : "#e0903a", marginBottom:10, fontWeight:500 }}>{lbl}</div>
          {items.map((it,i)=><div key={i} style={{ fontSize:12, color:"#b0bcc0", marginBottom:5, lineHeight:1.6 }}>— {it}</div>)}
          {!items.length && <div style={{ fontSize:12, color:"#4a5060" }}>None</div>}
        </div>
      ))}
    </div>
  );

  const Warnings = () => r.warnings.length > 0 ? (
    <div style={{ border:"1px solid #604020", padding:12, marginBottom:14 }}>
      <div style={{ fontSize:11, letterSpacing:3, color:"#d4a040", marginBottom:10, fontWeight:500 }}>WARNINGS ({r.warnings.length})</div>
      {r.warnings.map((w,i)=><div key={i} style={{ fontSize:12, color:"#b09050", marginBottom:5 }}>⚠ {w}</div>)}
    </div>
  ) : null;

  const SH = ({label}) => <div style={{ fontSize:10, letterSpacing:3, color:"#8a9aaa", padding:"16px 0 8px", borderBottom:"1px solid #1e2530", marginBottom:12, fontWeight:500 }}>{label}</div>;
  const TH = ({children,right}) => <th style={{ padding:"8px 12px", textAlign:right?"right":"left", fontSize:10, letterSpacing:2, color:"#6a7888", borderBottom:"1px solid #1e2530", fontWeight:400 }}>{children}</th>;
  const TD = ({children,right,muted,warn,bold}) => <td style={{ padding:"9px 12px", textAlign:right?"right":"left", fontSize:bold?14:13, color:warn?"#c07850":bold?GOLD:muted?"#6a7888":"#d8d0c0", borderBottom:"1px solid #0a0c10", fontWeight:bold?500:400 }}>{children}</td>;

  // ── PRELIMINARY ──
  if (outputTypeId === "preliminary") {
    const byCat = byGroup("category");
    return <>
      <SH label="COST BY CATEGORY" />
      <div style={{ border:"1px solid #1e2530", marginBottom:20 }}>
        {Object.entries(byCat).map(([cat,items]) => {
          const total = items.reduce((s,i)=>s+(i.itemCost||0),0);
          return <CostRow key={cat} label={cat} value={total} />;
        })}
      </div>
      <SH label="COMMERCIAL SUMMARY" /><CommSummary /><AER /><Warnings />
    </>;
  }

  // ── ELEMENTAL / CONCEPT ──
  if (outputTypeId === "elemental" || outputTypeId === "concept") {
    const byEl = byGroup("element");
    const byCat = byGroup("category");
    return <>
      <SH label="ELEMENTAL BREAKDOWN" />
      <table style={{ width:"100%", borderCollapse:"collapse", marginBottom:20 }}>
        <thead><tr><TH>Element</TH><TH>Category</TH><TH right>Cost</TH><TH right>$/m²</TH></tr></thead>
        <tbody>
          {Object.entries(byEl).map(([el,items]) => {
            const total = items.reduce((s,i)=>s+(i.itemCost||0),0);
            return <tr key={el}><TD>{el}</TD><TD muted>{items[0]?.category}</TD><TD right>{fmtC(total)}</TD><TD right muted>{fmtC(Math.round(total/r.floorArea))}</TD></tr>;
          })}
        </tbody>
      </table>
      <SH label="CATEGORY TOTALS" />
      <div style={{ border:"1px solid #1e2530", marginBottom:20 }}>
        {Object.entries(byCat).map(([cat,items]) => <CostRow key={cat} label={cat} value={items.reduce((s,i)=>s+(i.itemCost||0),0)} />)}
      </div>
      <SH label="COMMERCIAL SUMMARY" /><CommSummary /><AER /><Warnings />
    </>;
  }

  // ── TRADE PACKAGE ──
  if (outputTypeId === "trade") {
    const byTrade = byGroup("trade");
    return <>
      <SH label="TRADE PACKAGE BREAKDOWN" />
      <table style={{ width:"100%", borderCollapse:"collapse", marginBottom:20 }}>
        <thead><tr><TH>Trade Package</TH><TH>Category</TH><TH right>Items</TH><TH right>Sub-total</TH><TH right>% Direct</TH></tr></thead>
        <tbody>
          {Object.entries(byTrade).sort((a,b)=>b[1].reduce((s,i)=>s+i.itemCost,0)-a[1].reduce((s,i)=>s+i.itemCost,0)).map(([trade,items]) => {
            const total = items.reduce((s,i)=>s+(i.itemCost||0),0);
            return <tr key={trade}><TD>{trade}</TD><TD muted>{items[0]?.category}</TD><TD right muted>{items.length}</TD><TD right>{fmtC(total)}</TD><TD right muted>{((total/r.directCost)*100).toFixed(1)}%</TD></tr>;
          })}
        </tbody>
      </table>
      <SH label="COMMERCIAL SUMMARY" /><CommSummary /><AER /><Warnings />
    </>;
  }

  // ── BOQ / DETAILED ──
  if (outputTypeId === "boq" || outputTypeId === "detailed") {
    const byTrade = r.items.reduce((a,i)=>{ const k=i.trade||"Unclassified"; (a[k]=a[k]||[]).push(i); return a; },{});
    return <>
      <SH label={outputTypeId === "boq" ? "BILL OF QUANTITIES" : "DETAILED QUANTITY ESTIMATE"} />
      {Object.entries(byTrade).map(([trade,items]) => (
        <div key={trade} style={{ marginBottom:20 }}>
          <div style={{ fontSize:11, letterSpacing:2, color:"#a0aab8", padding:"8px 12px", background:"#0d1016", borderBottom:"1px solid #1e2530" }}>{trade.toUpperCase()}</div>
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead><tr><TH>Code</TH><TH>Description</TH><TH right>Qty</TH><TH>Unit</TH>{outputTypeId==="boq"&&<TH right>Rate</TH>}<TH right>Amount</TH></tr></thead>
            <tbody>
              {items.map((item,i)=>(
                <tr key={i} style={{ background:i%2===0?"transparent":"#060809" }}>
                  <TD muted>{item.rateId||"—"}</TD>
                  <TD>{item.description}</TD>
                  <TD right>{fmt(item.quantity)}</TD>
                  <TD muted>{item.unit}</TD>
                  {outputTypeId==="boq"&&<TD right muted>{item.adjustedRate?fmtC(item.adjustedRate):"PROV"}</TD>}
                  <TD right warn={!item.itemCost}>{item.itemCost?fmtC(item.itemCost):"UNRESOLVED"}</TD>
                </tr>
              ))}
              <tr>
                <td colSpan={outputTypeId==="boq"?5:4} style={{ padding:"8px 12px", fontSize:11, color:"#7a8898", textAlign:"right", letterSpacing:1 }}>SUB-TOTAL {trade.toUpperCase()}</td>
                <td style={{ padding:"7px 10px", textAlign:"right", fontSize:12, color:GOLD, fontWeight:500 }}>{fmtC(items.reduce((s,i)=>s+(i.itemCost||0),0))}</td>
              </tr>
            </tbody>
          </table>
        </div>
      ))}
      <SH label="COMMERCIAL SUMMARY" /><CommSummary /><AER /><Warnings />
    </>;
  }

  // ── SCHEDULE OF QUANTITIES ──
  if (outputTypeId === "schedule") {
    const byTrade = r.items.reduce((a,i)=>{ const k=i.trade||"Unclassified"; (a[k]=a[k]||[]).push(i); return a; },{});
    return <>
      <SH label="SCHEDULE OF QUANTITIES" />
      <div style={{ padding:"11px 14px", border:"1px solid #1e2530", marginBottom:16, fontSize:12, color:"#7a8898" }}>Rates and amounts not shown. For contractor pricing.</div>
      {Object.entries(byTrade).map(([trade,items])=>(
        <div key={trade} style={{ marginBottom:16 }}>
          <div style={{ fontSize:11, letterSpacing:2, color:"#a0aab8", padding:"8px 12px", background:"#0d1016" }}>{trade.toUpperCase()}</div>
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead><tr><TH>Code</TH><TH>Description</TH><TH>Element</TH><TH right>Qty</TH><TH>Unit</TH><TH right>Rate</TH><TH right>Amount</TH></tr></thead>
            <tbody>
              {items.map((it,i)=>(
                <tr key={i}><TD muted>{it.rateId||"—"}</TD><TD>{it.description}</TD><TD muted>{it.element||"—"}</TD><TD right>{fmt(it.quantity)}</TD><TD muted>{it.unit}</TD><TD right muted>........</TD><TD right muted>........</TD></tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
      <AER />
    </>;
  }

  // ── FEASIBILITY ──
  if (outputTypeId === "feasibility") {
    const low = Math.round(r.totalExGst * 0.88);
    const high = Math.round(r.totalExGst * 1.15);
    return <>
      <SH label="FEASIBILITY COST RANGE" />
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12, marginBottom:20 }}>
        {[["LOW",low,"#406060"],["CENTRAL",r.totalExGst,GOLD],["HIGH",high,"#a06040"]].map(([lbl,val,col])=>(
          <div key={lbl} style={{ border:`1px solid ${col}50`, padding:18, textAlign:"center" }}>
            <div style={{ fontSize:10, letterSpacing:2, color:col, marginBottom:6, fontWeight:500 }}>{lbl} ESTIMATE</div>
            <div style={{ fontSize:20, color:col }}>{fmtC(val)}</div>
            <div style={{ fontSize:11, color:"#7a8898", marginTop:4 }}>{fmtC(Math.round(val/r.floorArea))}/m²</div>
          </div>
        ))}
      </div>
      <div style={{ border:"1px solid #1e2530", padding:14, marginBottom:20 }}>
        <div style={{ fontSize:10, letterSpacing:3, color:"#8a9aaa", marginBottom:10, fontWeight:500 }}>AUCKLAND RESIDENTIAL BENCHMARK</div>
        {[["Budget residential","$2,200–$2,800/m²"],["Standard residential","$3,000–$3,800/m²"],["Premium residential","$4,200–$5,500/m²"],["This estimate",fmtC(r.costPerM2)+"/m²"]].map(([l,v])=>(
          <div key={l} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:"1px solid #0a0c10" }}>
            <span style={{ fontSize:13, color:"#a0a8b0" }}>{l}</span>
            <span style={{ fontSize:13, color:l==="This estimate"?GOLD:"#8a9090" }}>{v}</span>
          </div>
        ))}
      </div>
      <SH label="COMMERCIAL SUMMARY" /><CommSummary /><AER />
    </>;
  }

  // ── CASHFLOW ──
  if (outputTypeId === "cashflow") {
    const profile = [2,3,5,8,10,12,13,13,12,10,7,5];
    let cum = 0;
    const rows = profile.map((pct,i)=>{ const m=Math.round(r.totalExGst*pct/100); cum+=m; return {m:`Month ${i+1}`,pct,monthly:m,cum}; });
    const maxBar = Math.max(...rows.map(x=>x.monthly));
    return <>
      <SH label="12-MONTH CASHFLOW FORECAST" />
      <div style={{ marginBottom:20 }}>
        {rows.map((row,i)=>(
          <div key={i} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:5 }}>
            <div style={{ width:60, fontSize:10, color:"#8a9aaa", letterSpacing:1, flexShrink:0 }}>{row.m}</div>
            <div style={{ flex:1, height:20, background:"#0d1016", position:"relative", overflow:"hidden" }}>
              <div style={{ position:"absolute", left:0, top:0, height:"100%", width:`${(row.monthly/maxBar)*100}%`, background:GOLD, opacity:0.55 }}/>
              <div style={{ position:"absolute", left:10, top:2, fontSize:11, color:"#e8e4da" }}>{fmtC(row.monthly)}</div>
            </div>
            <div style={{ width:110, fontSize:11, color:"#6a7888", textAlign:"right", flexShrink:0 }}>Cum: {fmtC(row.cum)}</div>
          </div>
        ))}
      </div>
      <table style={{ width:"100%", borderCollapse:"collapse", marginBottom:20 }}>
        <thead><tr><TH>Period</TH><TH right>%</TH><TH right>Monthly Spend</TH><TH right>Cumulative</TH></tr></thead>
        <tbody>
          {rows.map((row,i)=><tr key={i}><TD>{row.m}</TD><TD right muted>{row.pct}%</TD><TD right>{fmtC(row.monthly)}</TD><TD right muted>{fmtC(row.cum)}</TD></tr>)}
          <tr><TD bold>TOTAL</TD><TD right bold>100%</TD><TD right bold>{fmtC(r.totalExGst)}</TD><TD right bold>{fmtC(r.totalExGst)}</TD></tr>
        </tbody>
      </table>
      <AER />
    </>;
  }

  // ── MATERIALS TAKE-OFF ──
  if (outputTypeId === "materials") {
    return <>
      <SH label="MATERIALS TAKE-OFF SCHEDULE" />
      <div style={{ padding:"11px 14px", border:"1px solid #1e2530", marginBottom:14, fontSize:12, color:"#7a8898" }}>Quantities for procurement. Rates not shown.</div>
      <table style={{ width:"100%", borderCollapse:"collapse", marginBottom:20 }}>
        <thead><tr><TH>Code</TH><TH>Description</TH><TH>Element</TH><TH right>Quantity</TH><TH>Unit</TH><TH>Trade</TH></tr></thead>
        <tbody>
          {r.items.map((item,i)=>(
            <tr key={i} style={{ background:i%2===0?"transparent":"#060809" }}>
              <TD muted>{item.rateId||"—"}</TD><TD>{item.description}</TD><TD muted>{item.element||"—"}</TD>
              <TD right>{fmt(item.quantity)}</TD><TD muted>{item.unit}</TD><TD muted>{item.trade||"—"}</TD>
            </tr>
          ))}
        </tbody>
      </table>
      <AER />
    </>;
  }

  // ── PROCUREMENT ──
  if (outputTypeId === "procurement") {
    const byTrade = byGroup("trade");
    return <>
      <SH label="TRADE PACKAGE PROCUREMENT SCHEDULE" />
      <table style={{ width:"100%", borderCollapse:"collapse", marginBottom:20 }}>
        <thead><tr><TH>Package</TH><TH>Category</TH><TH right>Estimated Value</TH><TH right>% Split</TH><TH>Basis</TH></tr></thead>
        <tbody>
          {Object.entries(byTrade).sort((a,b)=>b[1].reduce((s,i)=>s+i.itemCost,0)-a[1].reduce((s,i)=>s+i.itemCost,0)).map(([trade,items])=>{
            const total = items.reduce((s,i)=>s+(i.itemCost||0),0);
            return <tr key={trade}><TD>{trade}</TD><TD muted>{items[0]?.category}</TD><TD right>{fmtC(total)}</TD><TD right muted>{((total/r.directCost)*100).toFixed(1)}%</TD><TD muted>Lump sum</TD></tr>;
          })}
        </tbody>
      </table>
      <SH label="COMMERCIAL SUMMARY" /><CommSummary /><AER /><Warnings />
    </>;
  }

  return <div style={{ color:"#3a4050", fontSize:11 }}>Select a document type from the sidebar.</div>;
}

// ════════════════════════════════════════════════════════════════════════════
// CONTRACT SCANNER
// ════════════════════════════════════════════════════════════════════════════
function ContractScanner({ project }) {
  const [scanStage, setScanStage] = useState("upload");
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState("");
  const [pasteText, setPasteText] = useState("");
  const [userRole, setUserRole] = useState("client");
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState("");
  const [scanProgress, setScanProgress] = useState(0);
  const [activeTab, setActiveTab] = useState("risks");
  const [filterSev, setFilterSev] = useState("all");
  const fileInputRef = useRef();
  const scanInterval = useRef();

  const sevColor = { red: "#e05050", amber: "#d4943a", green: "#5aaa6a" };
  const sevBg = { red: "#1e0a0a", amber: "#1a1200", green: "#0a1a0a" };
  const sevBorder = { red: "#603030", amber: "#604010", green: "#306030" };
  const overallColor = { low: "#5aaa6a", medium: "#d4943a", high: "#e05050", critical: "#c02020" };

  function buildEstimateContext(p) {
    if (!p) return null;
    return `Project: ${p.name}
Type: ${p.type}
Location: ${p.location}
Floor Area: ${p.floorArea}m² GFA
APEXBOS Estimate Total (ex GST): ${fmtC(p.totalExGst)}
Cost per m²: ${fmtC(p.costPerM2)}/m²
Direct Construction Cost: ${fmtC(p.directCost)}
Preliminaries: ${fmtC(p.prelims)}
Overhead: ${fmtC(p.overhead)}
Profit: ${fmtC(p.profit)}
Contingency: ${fmtC(p.contingency)} (${p.contPct}%)
Estimate Stage: ${p.stage}
Estimate Confidence: ${p.confidence}
Estimate Run ID: ${p.runId}
Cashflow Profile (% per month): ${p.cashflowProfile?.join(", ")}%
Key Assumptions: ${p.assumptions?.join("; ")}
Exclusions: ${p.exclusions?.join("; ")}`;
  }

  async function readFile(file) {
    setFileName(file.name);
    const ext = file.name.split(".").pop().toLowerCase();
    if (ext === "pdf") {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve({ type: "pdf", data: reader.result.split(",")[1] });
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    } else if (ext === "docx" || ext === "doc") {
      const mammoth = await import("mammoth");
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      return { type: "text", data: result.value };
    } else {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve({ type: "text", data: reader.result });
        reader.onerror = reject;
        reader.readAsText(file);
      });
    }
  }

  async function scanContract(fileData) {
    setScanStage("scanning"); setScanProgress(0); setError("");
    scanInterval.current = setInterval(() => setScanProgress(p => Math.min(p + Math.random() * 7, 88)), 450);
    try {
      const estimateCtx = buildEstimateContext(project);
      let messages;
      if (fileData.type === "pdf") {
        messages = [{ role: "user", content: [{ type: "document", source: { type: "base64", media_type: "application/pdf", data: fileData.data } }, { type: "text", text: `Scan this NZ construction contract. User role: ${userRole}. Return JSON analysis as instructed.` }] }];
      } else {
        messages = [{ role: "user", content: `Scan this NZ construction contract. User role: ${userRole}.\n\nCONTRACT:\n\n${fileData.data}\n\nReturn JSON as instructed.` }];
      }
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": "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", "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 4000, system: CONTRACT_SYSTEM_PROMPT(estimateCtx), messages }),
      });
      const data = await response.json();
      const text = data.content?.map(b => b.text || "").join("") || "";
      const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
      clearInterval(scanInterval.current);
      setScanProgress(100);
      await new Promise(r => setTimeout(r, 400));
      setAnalysis(parsed);
      setScanStage("results");
      setActiveTab(parsed.estimate_alignment ? "alignment" : "risks");
    } catch (err) {
      clearInterval(scanInterval.current);
      setError("Scan failed: " + err.message);
      setScanStage("upload");
    }
  }

  async function handleFile(file) {
    try { setError(""); const fd = await readFile(file); await scanContract(fd); }
    catch (err) { setError(err.message); }
  }

  const onDrop = useCallback(e => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }, [userRole, project]);
  const filteredFlags = analysis?.risk_flags?.filter(f => filterSev === "all" || f.severity === filterSev) || [];

  return (
    <div className="fade-in">

      {/* ── UPLOAD ── */}
      {scanStage === "upload" && (
        <div style={{ maxWidth: 820 }}>
          {/* Context banner */}
          {project ? (
            <div style={{ border: "1px solid #2a4030", background: "#0a1a0a", padding: "14px 18px", marginBottom: 20, display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#5aaa6a", flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 10, color: "#5aaa6a", letterSpacing: 1, marginBottom: 3 }}>ESTIMATE CONTEXT LOADED</div>
                <div style={{ fontSize: 11, color: "#8a9090" }}>{project.name} · {fmtC(project.totalExGst)} · {fmtC(project.costPerM2)}/m²</div>
                <div style={{ fontSize: 9, color: "#3a5030", marginTop: 2 }}>Claude will cross-reference the contract against this estimate — flagging value discrepancies, scope gaps, and milestone misalignment.</div>
              </div>
            </div>
          ) : (
            <div style={{ border: "1px solid #2a2010", background: "#0f0c06", padding: "12px 18px", marginBottom: 20 }}>
              <div style={{ fontSize: 9, color: "#806040", letterSpacing: 1 }}>NO ESTIMATE CONTEXT · Run the Estimating Agent first to enable cross-referencing</div>
            </div>
          )}

          <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 28, letterSpacing: 3, color: "#ddd8cc", marginBottom: 6 }}>CONTRACT SCANNER</div>
          <div style={{ fontSize: 10, color: "#5a6070", letterSpacing: 1, marginBottom: 20 }}>Upload any NZ construction contract for AI risk analysis</div>

          {/* Role */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 9, letterSpacing: 3, color: "#5a6070", marginBottom: 8 }}>YOUR ROLE</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {[["client","Client / Homeowner"],["contractor","Builder / Contractor"],["subcontractor","Subcontractor"],["qs","QS / Project Manager"],["developer","Developer"]].map(([val, lbl]) => (
                <button key={val} className="btn" onClick={() => setUserRole(val)} style={{ padding: "7px 14px", border: `1px solid ${userRole === val ? GOLD : "#1e2530"}`, background: userRole === val ? "#141820" : "transparent", color: userRole === val ? GOLD : "#5a6070", fontSize: 9, letterSpacing: 1 }}>{lbl}</button>
              ))}
            </div>
          </div>

          {/* Drop zone */}
          <div onDrop={onDrop} onDragOver={e => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onClick={() => fileInputRef.current?.click()}
            style={{ border: `2px dashed ${dragging ? GOLD : "#1e2a3a"}`, padding: "52px 40px", textAlign: "center", cursor: "pointer", background: dragging ? "#0d1520" : "#090c10", marginBottom: 16, transition: "all 0.2s" }}>
            <div style={{ fontSize: 28, marginBottom: 10, opacity: 0.35 }}>📄</div>
            <div style={{ fontSize: 13, color: "#8a90a0", marginBottom: 6 }}>Drop your contract here</div>
            <div style={{ fontSize: 9, color: "#3a4050", letterSpacing: 2 }}>PDF · DOCX · TXT — or click to browse</div>
            <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx,.txt" onChange={e => e.target.files[0] && handleFile(e.target.files[0])} style={{ display: "none" }} />
          </div>

          <details style={{ marginBottom: 16 }}>
            <summary style={{ fontSize: 9, color: "#3a4050", letterSpacing: 2, cursor: "pointer", padding: "6px 0", userSelect: "none" }}>OR PASTE CONTRACT TEXT</summary>
            <textarea placeholder="Paste contract text here..." rows={8} value={pasteText} onChange={e => setPasteText(e.target.value)} style={{ width: "100%", marginTop: 10, background: "#090c10", border: "1px solid #1e2530", color: "#a8c4a0", padding: 12, fontSize: 11, lineHeight: 1.7, fontFamily: "'DM Mono',monospace", outline: "none" }} />
            {pasteText && <button className="btn" onClick={() => scanContract({ type: "text", data: pasteText })} style={{ marginTop: 10, padding: "9px 22px", background: "#1e2530", border: `1px solid ${GOLD}`, color: GOLD, fontSize: 9, letterSpacing: 3 }}>▶ SCAN TEXT</button>}
          </details>

          {error && <div style={{ padding: 12, border: "1px solid #603030", color: "#e07070", fontSize: 11, marginBottom: 14 }}>⚠ {error}</div>}
        </div>
      )}

      {/* ── SCANNING ── */}
      {scanStage === "scanning" && (
        <div style={{ maxWidth: 480, margin: "50px auto", textAlign: "center" }}>
          <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 26, letterSpacing: 4, color: GOLD, marginBottom: 6 }}>SCANNING CONTRACT</div>
          <div style={{ fontSize: 10, color: "#5a6070", letterSpacing: 1, marginBottom: 32 }}>{fileName || "Document"}{project ? ` · Cross-referencing against ${project.name}` : ""}</div>
          <div style={{ position: "relative", border: "1px solid #1e2530", padding: 20, marginBottom: 28, overflow: "hidden", background: "#090c10" }}>
            <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 2, background: `linear-gradient(90deg,transparent,${GOLD},transparent)`, animation: "scan 1.8s linear infinite" }} />
            {["Parsing document...","Identifying contract type...","Extracting parties & terms...","Scanning clauses for risk...",project?"Cross-referencing estimate...":"Checking NZS compliance...","Flagging risky clauses...","Assembling risk report..."].map((msg, i) => (
              <div key={i} style={{ fontSize: 10, color: scanProgress > i*13 ? "#6a9060" : "#2a3040", padding: "4px 0", textAlign: "left", transition: "color 0.4s", display: "flex", gap: 10 }}>
                <span>{scanProgress > i*13 ? "✓" : "·"}</span>{msg}
              </div>
            ))}
          </div>
          <div style={{ height: 3, background: "#1a2030", borderRadius: 2, overflow: "hidden", marginBottom: 10 }}>
            <div style={{ height: "100%", background: `linear-gradient(90deg,#8a6030,${GOLD})`, transition: "width 0.4s ease", width: `${scanProgress}%` }} />
          </div>
          <div style={{ fontSize: 10, color: "#5a6070" }}>{Math.round(scanProgress)}%</div>
        </div>
      )}

      {/* ── RESULTS ── */}
      {scanStage === "results" && analysis && (
        <div style={{ maxWidth: 880 }} className="print-doc">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
            <div style={{ flex: 1 }}>
              <DocHeader
                title="CONTRACT SCAN REPORT"
                sub={analysis.contract_type}
                meta={[analysis.parties?.principal && `Principal: ${analysis.parties.principal}`, analysis.parties?.contractor && `Contractor: ${analysis.parties.contractor}`].filter(Boolean).join(" · ")}
                badge={`${(analysis.overall_risk || "").toUpperCase()} RISK`}
                badgeColor={overallColor[analysis.overall_risk] || GOLD}
              />
            </div>
            <button className="btn no-print" onClick={() => window.print()} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", background: "#0d1016", border: `1px solid ${GOLD}60`, color: GOLD, fontSize: 9, letterSpacing: 2, marginLeft: 16, flexShrink: 0, marginTop: 4 }}>
              <span style={{ fontSize: 13 }}>⎙</span> PRINT / SAVE PDF
            </button>
          </div>

          {/* Risk score row */}
          <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
            {[["red", analysis.red_count || 0, "HIGH RISK"], ["amber", analysis.amber_count || 0, "REVIEW"], ["green", analysis.green_count || 0, "OK"]].map(([sev, count, lbl]) => (
              <div key={sev} style={{ padding: "12px 20px", border: `1px solid ${sevBorder[sev]}`, background: sevBg[sev], textAlign: "center", minWidth: 90 }}>
                <div style={{ fontSize: 24, color: sevColor[sev] }}>{count}</div>
                <div style={{ fontSize: 8, letterSpacing: 2, color: sevColor[sev], opacity: 0.7, marginTop: 2 }}>{lbl}</div>
              </div>
            ))}
            <div style={{ padding: "12px 20px", border: "1px solid #1e2530", flex: 1, fontSize: 11, color: "#8a9090", lineHeight: 1.6 }}>
              {analysis.overall_risk_reason}
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: 0, borderBottom: "1px solid #1e2530", marginBottom: 20 }} className="no-print">
            {[
              ...(analysis.estimate_alignment ? [["alignment", "Estimate Alignment ◈"]] : []),
              ["risks", `Risk Flags (${analysis.risk_flags?.length || 0})`],
              ["summary", "Summary"],
              ["payment", "Payment"],
              ["obligations", "Obligations"],
            ].map(([id, label]) => (
              <button key={id} className="btn" onClick={() => setActiveTab(id)} style={{ padding: "9px 18px", color: activeTab === id ? GOLD : "#3a4050", borderBottom: activeTab === id ? `2px solid ${GOLD}` : "2px solid transparent", fontSize: 9, letterSpacing: 1.5, background: "transparent", textTransform: "uppercase" }}>{label}</button>
            ))}
          </div>

          {/* ── ALIGNMENT TAB ── */}
          {activeTab === "alignment" && analysis.estimate_alignment && (
            <div>
              <div style={{ border: `1px solid ${GOLD}30`, background: "#0d1008", padding: 18, marginBottom: 16 }}>
                <div style={{ fontSize: 9, letterSpacing: 3, color: GOLD, marginBottom: 12 }}>ESTIMATE vs CONTRACT</div>
                {[
                  ["Contract Value vs Estimate", analysis.estimate_alignment.contract_value_vs_estimate],
                  ["Scope Match", analysis.estimate_alignment.scope_match],
                  ["Milestone vs Cashflow", analysis.estimate_alignment.milestone_vs_cashflow],
                ].filter(([,v])=>v).map(([lbl, val]) => (
                  <div key={lbl} style={{ marginBottom: 14, paddingBottom: 14, borderBottom: "1px solid #0a0c10" }}>
                    <div style={{ fontSize: 9, letterSpacing: 2, color: "#5a6070", marginBottom: 4 }}>{lbl.toUpperCase()}</div>
                    <div style={{ fontSize: 11, color: "#a0a8b0", lineHeight: 1.6 }}>{val}</div>
                  </div>
                ))}
                {analysis.estimate_alignment.discrepancies?.length > 0 && (
                  <div>
                    <div style={{ fontSize: 9, letterSpacing: 2, color: "#a07030", marginBottom: 8 }}>DISCREPANCIES NOTED</div>
                    {analysis.estimate_alignment.discrepancies.map((d, i) => (
                      <div key={i} style={{ fontSize: 11, color: "#806040", marginBottom: 6, display: "flex", gap: 8 }}><span>⚠</span>{d}</div>
                    ))}
                  </div>
                )}
              </div>
              {project && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div style={{ border: "1px solid #1e2530", padding: 14 }}>
                    <div style={{ fontSize: 9, letterSpacing: 3, color: "#5a6070", marginBottom: 10 }}>APEXBOS ESTIMATE</div>
                    {[["Total (ex GST)", fmtC(project.totalExGst)], ["Cost/m²", fmtC(project.costPerM2)+"/m²"], ["Stage", project.stage], ["Confidence", project.confidence]].map(([l,v])=>(
                      <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #0a0c10" }}>
                        <span style={{ fontSize: 10, color: "#3a4050" }}>{l}</span>
                        <span style={{ fontSize: 10, color: "#8a9090" }}>{v}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ border: "1px solid #1e2530", padding: 14 }}>
                    <div style={{ fontSize: 9, letterSpacing: 3, color: "#5a6070", marginBottom: 10 }}>CONTRACT DETAILS</div>
                    {[["Contract Sum", analysis.project?.value||"Not stated"], ["Start Date", analysis.project?.start_date||"—"], ["Completion", analysis.project?.completion_date||"—"], ["Defects Period", analysis.project?.defects_liability_period||"—"]].map(([l,v])=>(
                      <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #0a0c10" }}>
                        <span style={{ fontSize: 10, color: "#3a4050" }}>{l}</span>
                        <span style={{ fontSize: 10, color: "#8a9090" }}>{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── RISKS TAB ── */}
          {activeTab === "risks" && (
            <div>
              <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
                {[["all","All"], ["red","High Risk"], ["amber","Review"], ["green","OK"]].map(([val, lbl]) => (
                  <button key={val} className="btn" onClick={() => setFilterSev(val)} style={{ padding: "6px 12px", border: `1px solid ${filterSev===val?(val==="all"?GOLD:sevColor[val]||GOLD):"#1e2530"}`, background: filterSev===val?"#0d1016":"transparent", color: filterSev===val?(val==="all"?GOLD:sevColor[val]||GOLD):"#3a4050", fontSize: 9, letterSpacing: 1 }}>{lbl}</button>
                ))}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {filteredFlags.map((flag, i) => (
                  <div key={i} className="flag-card" style={{ border: `1px solid ${sevBorder[flag.severity]}`, background: sevBg[flag.severity], padding: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 8 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 7, height: 7, borderRadius: "50%", background: sevColor[flag.severity], flexShrink: 0 }} />
                        <div>
                          <div style={{ fontSize: 12, color: "#ddd8cc" }}>{flag.title}</div>
                          {flag.clause && <div style={{ fontSize: 9, color: "#5a6070", letterSpacing: 1, marginTop: 1 }}>CLAUSE {flag.clause}</div>}
                        </div>
                      </div>
                      <div style={{ padding: "3px 9px", border: `1px solid ${sevBorder[flag.severity]}`, fontSize: 9, letterSpacing: 1.5, color: sevColor[flag.severity], flexShrink: 0, textTransform: "uppercase" }}>
                        {flag.severity === "red" ? "High Risk" : flag.severity === "amber" ? "Review" : "Standard"}
                      </div>
                    </div>
                    <div style={{ fontSize: 11, color: "#8a9090", marginBottom: 8, lineHeight: 1.6 }}>{flag.issue}</div>
                    <div style={{ padding: "9px 12px", background: "#0a0d12", borderLeft: `3px solid ${sevColor[flag.severity]}40`, marginBottom: 8 }}>
                      <div style={{ fontSize: 8, letterSpacing: 2, color: "#3a4050", marginBottom: 4 }}>PLAIN ENGLISH</div>
                      <div style={{ fontSize: 11, color: "#a0a8b0", lineHeight: 1.6 }}>{flag.plain_english}</div>
                    </div>
                    {flag.recommendation && <div style={{ fontSize: 10, color: "#7a9870", lineHeight: 1.6 }}><span style={{ color: "#4a6840", letterSpacing: 1 }}>RECOMMENDATION: </span>{flag.recommendation}</div>}
                  </div>
                ))}
                {filteredFlags.length === 0 && <div style={{ fontSize: 11, color: "#2a3040", padding: "20px 0", textAlign: "center" }}>No flags match this filter</div>}
              </div>
            </div>
          )}

          {/* ── SUMMARY TAB ── */}
          {activeTab === "summary" && (
            <div>
              <div style={{ padding: 18, border: "1px solid #1e2530", marginBottom: 16, fontSize: 12, color: "#b0b8c0", lineHeight: 1.8 }}>{analysis.summary}</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {[["CONTRACT", [["Type",analysis.contract_type],["Value",analysis.project?.value],["Start",analysis.project?.start_date],["Completion",analysis.project?.completion_date],["Defects Period",analysis.project?.defects_liability_period]]],
                  ["PARTIES",[["Principal",analysis.parties?.principal],["Contractor",analysis.parties?.contractor],["Engineer / PM",analysis.parties?.engineer]]]].map(([title,rows])=>(
                  <div key={title} style={{ border: "1px solid #1e2530", padding: 14 }}>
                    <div style={{ fontSize: 9, letterSpacing: 3, color: "#5a6070", marginBottom: 10 }}>{title}</div>
                    {rows.filter(([,v])=>v).map(([l,v])=>(
                      <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid #0d1016", gap: 10 }}>
                        <span style={{ fontSize: 10, color: "#3a4050", flexShrink: 0 }}>{l}</span>
                        <span style={{ fontSize: 10, color: "#8a9090", textAlign: "right" }}>{v}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── PAYMENT TAB ── */}
          {activeTab === "payment" && (
            <div>
              <div style={{ border: "1px solid #1e2530", padding: 16, marginBottom: 14 }}>
                <div style={{ fontSize: 9, letterSpacing: 3, color: "#5a6070", marginBottom: 8 }}>PAYMENT TERMS</div>
                <div style={{ fontSize: 12, color: "#b0b8c0", lineHeight: 1.7 }}>{analysis.payment?.schedule || "Not specified"}</div>
              </div>
              {analysis.payment?.milestones?.length > 0 && (
                <div style={{ border: "1px solid #1e2530", padding: 16, marginBottom: 14 }}>
                  <div style={{ fontSize: 9, letterSpacing: 3, color: "#5a6070", marginBottom: 12 }}>PAYMENT MILESTONES</div>
                  {analysis.payment.milestones.map((m, i) => (
                    <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "9px 0", borderBottom: "1px solid #0d1016" }}>
                      <div style={{ width: 20, height: 20, borderRadius: "50%", border: `1px solid ${GOLD}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: GOLD, flexShrink: 0 }}>{i+1}</div>
                      <div style={{ fontSize: 11, color: "#a0a8b0", lineHeight: 1.6 }}>{m}</div>
                    </div>
                  ))}
                </div>
              )}
              {analysis.payment?.retention && (
                <div style={{ border: "1px solid #1e2530", padding: 14 }}>
                  <div style={{ fontSize: 9, letterSpacing: 3, color: "#5a6070", marginBottom: 6 }}>RETENTION</div>
                  <div style={{ fontSize: 12, color: "#a0a8b0", lineHeight: 1.6 }}>{analysis.payment.retention}</div>
                </div>
              )}
            </div>
          )}

          {/* ── OBLIGATIONS TAB ── */}
          {activeTab === "obligations" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              {[["PRINCIPAL", analysis.key_obligations?.principal, GOLD], ["CONTRACTOR", analysis.key_obligations?.contractor, "#5a9ab0"]].map(([title, items, col]) => (
                <div key={title} style={{ border: "1px solid #1e2530", padding: 16 }}>
                  <div style={{ fontSize: 9, letterSpacing: 3, color: col, opacity: 0.7, marginBottom: 12 }}>{title} OBLIGATIONS</div>
                  {(items || []).map((item, i) => (
                    <div key={i} style={{ display: "flex", gap: 10, padding: "8px 0", borderBottom: "1px solid #0d1016", alignItems: "flex-start" }}>
                      <span style={{ color: col, opacity: 0.4, flexShrink: 0 }}>→</span>
                      <span style={{ fontSize: 11, color: "#8a9090", lineHeight: 1.5 }}>{item}</span>
                    </div>
                  ))}
                  {(!items || !items.length) && <div style={{ fontSize: 10, color: "#2a3040" }}>Not specified</div>}
                </div>
              ))}
            </div>
          )}

          <div style={{ marginTop: 28, paddingTop: 14, borderTop: "1px solid #1a2030", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }} className="no-print">
            <button className="btn" onClick={() => { setScanStage("upload"); setAnalysis(null); setFileName(""); }} style={{ padding: "7px 16px", background: "transparent", border: "1px solid #2a3040", color: "#5a6070", fontSize: 9, letterSpacing: 2 }}>← NEW SCAN</button>
            <div style={{ fontSize: 9, color: "#2a3040" }}>AI analysis only — not legal advice · APEXBOS Contract Scanner · {new Date().toLocaleDateString("en-NZ")}</div>
          </div>
          <div className="print-only" style={{ display: "none", marginTop: 28, paddingTop: 14, borderTop: "1px solid #ccc", fontSize: 8, color: "#666" }}>
            AI analysis only — not legal advice. This report does not constitute legal advice. APEXBOS Contract Scanner · {new Date().toLocaleDateString("en-NZ")}
          </div>
        </div>
      )}
    </div>
  );
}
