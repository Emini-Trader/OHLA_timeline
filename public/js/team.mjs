/**
 * Teamstruktur / Team Structure view.
 * Presentation only – content comes from ./team/team-data.mjs.
 */
import {
  SOURCE, ORGANIZATIONS, ROLES, FIELD_DUTIES, RELATIONSHIPS, TOOLS,
  REFERENCE_NETWORK, STAGES, CONTINUITY, NOTES,
} from "./team/team-data.mjs";

const STR = {
  no: {
    kicker: "E105 Gjønnestunnelen · Landmåling",
    title: "Organisering av <span class=\"accent\">landmålingstjenestene</span>",
    lead: "Landmålingsorganisasjonen har utviklet seg i takt med prosjektet: fra kontraktens to kjernefunksjoner til en utvidet feltorganisasjon da byggeaktiviteten økte, med tydelig ansvarsdeling, samarbeid med eksterne parter og felles datautveksling.",
    allocNote: "Ressursandeler per rolle slik de er angitt i kildematerialet. De er ikke kontraktsmessige minimum, stillingsprosenter eller garantert fysisk tilstedeværelse, og summeres ikke til et antall personer.",
    current: "Nåværende", planned: "Planlagt", baseline: "Kontraktsgrunnlag", external: "Ekstern",
    contractBase: "Kontraktsfestet kjernefunksjon",
    bEb: "B · Organisasjonskart", bTitle: "Ansvar, samarbeid og informasjonsflyt",
    bLede: "Kartet skiller mellom intern koordinering i NORMA, samarbeid med eksterne parter og teknisk datautveksling. Ingen av forbindelsene til eksterne parter er rapporteringslinjer. Pek på eller velg en boks for å se ansvar og forbindelser.",
    legend: "Forklaring",
    types: {
      internal: "Intern koordinering (NORMA)", coordination: "Operativ koordinering med OHLA",
      cooperation: "Eksternt faglig samarbeid", communication: "Teknisk kommunikasjon med byggherre",
      contract: "Byggherre – totalentreprenør (utenfor NORMA)", data: "Teknisk datautveksling",
      backup: "Midlertidig reserve ved fravær",
    },
    shortLabels: { "ohla-lead": "Koordinering", "svv-qs": "Kommunikasjon", "lead-qs": "Intern", "lead-metrostav": "Referansenett", "backup-metrostav": "Reserve", "ohla-svv": "Kontrakt" },
    reserve: "Reserve", norma: "NORMA GEOSYSTEMS · LANDMÅLING",
    trimbleBand: "Trimble Connect – felles skybasert plattform for BIM og datautveksling",
    trimbleSub: "NORMA/OHLA-teamet, inkl. METROSTAV",
    increase: "→ 100 % planlagt", proposed: "foreslått",
    sourceLbl: "Kilde", responsibilities: "Ansvar", connections: "Forbindelser",
    detailHint: "Velg en boks i kartet for å se detaljer.",
    tableToggle: "Vis alle forbindelser i tabellform (med kildehenvisning)", tableHide: "Skjul tabell",
    from: "Fra", to: "Til", type: "Type", label: "Beskrivelse", status: "Status",
    cEb: "C · Utvikling", cTitle: "Fra kontraktsgrunnlag til dagens drift",
    cLede: "Rekkefølgen viser hvordan organisasjonen har utviklet seg. Kildene oppgir ingen datoer, derfor vises ingen.",
    stage: "Trinn",
    dEb: "D · Teknisk samarbeid", dTitle: "Referansenett og datautveksling",
    refTitle: "Referansenett – NORMA og METROSTAV",
    refText: "NORMAs stikningsleder har etablert et nært samarbeid med METROSTAV om prosjektets referansenett.",
    toolsTitle: "Programvare og plattform",
    processing: "Beregning og databehandling", platform: "Felles samhandlingsplattform",
    toolsNote: "Beregningsverktøyene brukes til faglig bearbeiding; Trimble Connect er den felles plattformen for deling av prosjektinformasjon.",
    eEb: "E · Beredskap", eTitle: "Beredskap og kontinuitet",
    notesTitle: "Tolkning av kildematerialet",
    notesSrc: "Kilder: {wb} (fane {sheet}) og {rpt}.",
    roleTitles: {},
  },
  en: {
    kicker: "E105 Gjønnestunnelen · Surveying",
    title: "Surveying <span class=\"accent\">Team Organization</span>",
    lead: "The surveying organization has developed alongside the project: from the contract's two core functions to an expanded field organization as construction activity increased, with clear responsibilities, cooperation with external parties and shared data exchange.",
    allocNote: "Resource allocations per role as shown in the source material. They are not contractual minimums, employment percentages or guaranteed physical presence, and are not summed into a headcount.",
    current: "Current", planned: "Planned", baseline: "Contractual baseline", external: "External",
    contractBase: "Contractual core function",
    bEb: "B · Organizational diagram", bTitle: "Responsibilities, cooperation and information flow",
    bLede: "The diagram distinguishes internal NORMA coordination, cooperation with external parties and technical data exchange. None of the links to external parties are reporting lines. Hover or select a box to see responsibilities and connections.",
    legend: "Legend",
    types: {
      internal: "Internal coordination (NORMA)", coordination: "Operational coordination with OHLA",
      cooperation: "External technical cooperation", communication: "Technical communication with the client",
      contract: "Client – main contractor (outside NORMA)", data: "Technical data exchange",
      backup: "Temporary backup during absence",
    },
    shortLabels: { "ohla-lead": "Coordination", "svv-qs": "Communication", "lead-qs": "Internal", "lead-metrostav": "Ref. network", "backup-metrostav": "Backup", "ohla-svv": "Contract" },
    reserve: "Backup", norma: "NORMA GEOSYSTEMS · SURVEYING",
    trimbleBand: "Trimble Connect – shared cloud-based platform for BIM and data exchange",
    trimbleSub: "NORMA/OHLA team, incl. METROSTAV",
    increase: "→ 100 % planned", proposed: "proposed",
    sourceLbl: "Source", responsibilities: "Responsibilities", connections: "Connections",
    detailHint: "Select a box in the diagram to see details.",
    tableToggle: "Show all connections as a table (with source references)", tableHide: "Hide table",
    from: "From", to: "To", type: "Type", label: "Description", status: "Status",
    cEb: "C · Development", cTitle: "From contractual baseline to current operations",
    cLede: "The sequence shows how the organization developed. The sources give no dates, so none are shown.",
    stage: "Stage",
    dEb: "D · Technical collaboration", dTitle: "Reference network and data exchange",
    refTitle: "Reference network – NORMA and METROSTAV",
    refText: "NORMA's Lead Surveyor has established close cooperation with METROSTAV on the project's reference network.",
    toolsTitle: "Software and platform",
    processing: "Calculation and data processing", platform: "Shared collaboration platform",
    toolsNote: "The calculation tools are used for technical processing; Trimble Connect is the shared platform for project information.",
    eEb: "E · Continuity", eTitle: "Operational Backup & Continuity",
    notesTitle: "Interpretation of the source material",
    notesSrc: "Sources: {wb} (sheet {sheet}) and {rpt}.",
  },
};

/* ------------------------------------------------------------------ */
let root = null, lang = "no", selected = "lead", interacted = false;
const T = () => STR[lang];
const L = o => (o ? o[lang] ?? o.no : "");
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const tpl = (s, v) => s.replace(/\{(\w+)\}/g, (_, k) => v[k] ?? "");
const pct = n => `${n} %`;
const ENTITIES = Object.fromEntries([...ORGANIZATIONS, ...ROLES, { id: "trimble", name: { no: "Trimble Connect", en: "Trimble Connect" } }].map(e => [e.id, e]));
const nameOf = id => L(ENTITIES[id]?.title || ENTITIES[id]?.name);
const duties = r => (r.responsibilities === "field" ? FIELD_DUTIES : r.responsibilities || []);

export function show(container) {
  lang = window.OHLA?.lang || document.documentElement.lang || "no";
  if (!root) {
    root = container;
    document.addEventListener("ohla:lang", e => { lang = e.detail.lang; if (root) render(); });
  }
  render();
}

function render() {
  const t = T();
  root.innerHTML = `${hero()}
  <div class="team">
    <section class="section" aria-labelledby="team-b"><div class="wrap">
      <div class="eyebrow">${esc(t.bEb)}</div>
      <h2 class="sec-title" id="team-b">${esc(t.bTitle)}</h2>
      <p class="team-lede">${esc(t.bLede)}</p>
      ${legend()}
      <div class="team-diagram card">${diagram()}</div>
      <div class="team-list">${mobileList()}</div>
      <div class="team-detail card" aria-live="polite" data-detail></div>
      <details class="fin-details team-table">
        <summary><span class="when-closed">${esc(t.tableToggle)}</span><span class="when-open">${esc(t.tableHide)}</span></summary>
        ${relationsTable()}
      </details>
    </div></section>
    ${stages()}
    ${collaboration()}
    ${continuity()}
  </div>`;
  bind();
  renderDetail(selected);
}

/* ---------------- A – overview ---------------- */
function hero() {
  const t = T();
  const current = ROLES.filter(r => r.status === "current");
  return `<section class="hero team-hero"><div class="wrap">
    <div class="badge-live">${esc(t.kicker)}</div>
    <h1>${t.title}</h1>
    <p>${esc(t.lead)}</p>
    <div class="kpis team-kpis">${current.map(r => `<div class="kpi">
      <div class="l">${esc(L(r.title))}</div>
      <div class="v">${esc(r.allocationPct)}<small class="team-unit">%</small></div>
      <div class="s">${esc(r.contractualBaseline ? t.contractBase : t.current)}</div></div>`).join("")}
    </div>
    <p class="team-alloc-note">${esc(t.allocNote)}</p>
  </div></section>`;
}

/* ---------------- B – diagram ---------------- */
const LINE_TYPES = ["internal", "coordination", "cooperation", "communication", "contract", "data", "backup"];

function legend() {
  const t = T();
  const sample = type => `<svg width="44" height="12" aria-hidden="true"><line class="e e-${type}" x1="2" x2="42" y1="6" y2="6"/></svg>`;
  return `<div class="team-legend" role="list" aria-label="${esc(t.legend)}">
    ${LINE_TYPES.map(k => `<span role="listitem">${sample(k)}${esc(t.types[k])}</span>`).join("")}
    <span role="listitem"><b class="team-sw team-sw-cur"></b>${esc(t.current)}</span>
    <span role="listitem"><b class="team-sw team-sw-plan"></b>${esc(t.planned)}</span>
    <span role="listitem"><b class="team-sw team-sw-ext"></b>${esc(t.external)}</span>
  </div>`;
}

const BOX = {
  ohla: { x: 340, y: 16, w: 280, h: 62 }, svv: { x: 800, y: 16, w: 280, h: 62 },
  metrostav: { x: 30, y: 146, w: 200, h: 92 },
  lead: { x: 340, y: 146, w: 280, h: 86 }, qs: { x: 800, y: 146, w: 260, h: 86 },
  field1: { x: 400, y: 256, w: 220, h: 82 }, field2: { x: 400, y: 350, w: 220, h: 82 },
  tunnel: { x: 400, y: 444, w: 220, h: 82 },
};

/* Orthogonal paths for each relationship id (wide layout). */
const PATH = {
  "ohla-svv": "M620,47 H800",
  "ohla-lead": "M480,78 V146",
  "svv-qs": "M930,78 V146",
  "lead-qs": "M620,189 H800",
  "lead-metrostav": "M340,189 H230",
  "backup-metrostav": "M340,220 H230",
  "lead-field1": "M370,232 V297 H400",
  "lead-field2": "M370,297 V391 H400",
  "lead-tunnel": "M370,391 V485 H400",
  "backup-field1": "M620,214 H652 V305 H620",
  "backup-field2": "M652,305 V399 H620",
  "backup-tunnel": "M652,399 V493 H620",
  "field1-qs": "M620,289 H930 V232",
  "field2-qs": "M620,383 H930 V289",
  "tunnel-qs": "M620,477 H930 V383",
  "metrostav-qs": "M190,238 V566 H1010 V232",
  "metrostav-trimble": "M90,238 V586",
  "norma-trimble": "M700,550 V586",
  "ohla-trimble": "M340,40 H14 V614 H40",
};
const LABEL_AT = {
  "ohla-svv": [710, 39], "ohla-lead": [488, 116, "start"], "svv-qs": [938, 116, "start"],
  "lead-qs": [710, 181], "lead-metrostav": [285, 181], "backup-metrostav": [285, 238],
};

function nodeSvg(id) {
  const t = T();
  const b = BOX[id];
  const e = ENTITIES[id];
  const role = ROLES.find(r => r.id === id);
  const planned = role?.status === "planned";
  const ext = !role;
  const cls = ext ? "n-ext" : planned ? "n-plan" : "n-cur";
  let inner = "";
  const tx = b.x + 14;
  if (ext) {
    inner = `<text class="n-kicker" x="${tx}" y="${b.y + 22}">${esc(t.external.toUpperCase())} · ${esc(L(e.role).toUpperCase())}</text>
      <text class="n-title" x="${tx}" y="${b.y + 46}">${esc(L(e.name).split(" – ")[0])}</text>
      ${id === "metrostav" ? `<text class="n-src" x="${tx}" y="${b.y + 76}">${esc(t.sourceLbl)}: «${esc(e.source.label)}»</text>` : ""}`;
  } else {
    const status = (planned ? t.planned : t.current).toUpperCase();
    const kicker = [status, role.contractualBaseline ? t.baseline.toUpperCase() : role.group ? L(role.group).toUpperCase() : ""].filter(Boolean).join(" · ");
    inner = `<rect class="n-accent" x="${b.x}" y="${b.y}" width="${b.w}" height="4"/>
      <text class="n-status ${planned ? "plan" : "cur"}" x="${tx}" y="${b.y + 21}">${esc(kicker)}</text>
      <text class="n-title" x="${tx}" y="${b.y + 41}">${esc(L(role.shortTitle || role.title))}</text>`;
    const by = b.y + b.h - 18;
    const bw = b.w - 28;
    if (role.plannedAllocationPct) {
      const cur = bw * role.allocationPct / 100;
      inner += `<rect class="n-bar" x="${tx}" y="${by}" width="${cur}" height="8"/>
        <rect class="n-bar-plan" x="${tx + cur + 1}" y="${by + .5}" width="${bw - cur - 1}" height="7"/>
        <text class="n-alloc" x="${tx}" y="${by - 6}">${esc(pct(role.allocationPct))}</text>
        <text class="n-src" x="${tx + bw}" y="${by - 6}" text-anchor="end">${esc(t.increase)}</text>`;
    } else {
      const w = bw * role.allocationPct / 100;
      inner += `<rect class="${planned ? "n-bar-plan" : "n-bar"}" x="${tx}" y="${by}" width="${w}" height="8"/>
        <text class="n-alloc" x="${tx}" y="${by - 6}">${esc(pct(role.allocationPct))}${planned ? ` (${esc(t.proposed)})` : ""}${role.subtitle ? ` · ${esc(L(role.subtitle).toLowerCase())}` : ""}</text>`;
    }
  }
  return `<g class="node ${cls}" data-node="${id}" tabindex="0" role="button" aria-pressed="${selected === id}" aria-label="${esc(nameOf(id))}">
    <rect class="n-box" x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}"/>${inner}</g>`;
}

function diagram() {
  const t = T();
  const edges = RELATIONSHIPS.map(r => {
    const d = PATH[r.id];
    if (!d) return "";
    const planned = r.status === "planned" ? " planned" : "";
    const lab = LABEL_AT[r.id] && t.shortLabels[r.id]
      ? `<text class="e-label" x="${LABEL_AT[r.id][0]}" y="${LABEL_AT[r.id][1]}" text-anchor="${LABEL_AT[r.id][2] || "middle"}">${esc(t.shortLabels[r.id])}</text>` : "";
    return `<g class="edge${planned}" data-from="${r.from}" data-to="${r.to}" data-type="${r.type}">
      <path class="e-halo" d="${d}"/><path class="e e-${r.type}" d="${d}"><title>${esc(L(r.label))}</title></path>${lab}</g>`;
  }).join("");
  return `<svg class="team-svg" viewBox="0 0 1120 660" role="group" aria-label="${esc(T().bTitle)}">
    <rect class="norma-zone" x="280" y="110" width="820" height="440"/>
    <text class="zone-label" x="296" y="540">${esc(t.norma)}</text>
    <text class="e-label e-label-backup" x="660" y="262" text-anchor="start">${esc(t.reserve)}</text>
    ${edges}
    <g class="node n-band" data-node="trimble" tabindex="0" role="button" aria-label="Trimble Connect">
      <rect class="n-box" x="40" y="586" width="1060" height="56"/>
      <text class="n-title" x="58" y="611">${esc(t.trimbleBand)}</text>
      <text class="n-sub" x="58" y="630">${esc(t.trimbleSub)}</text>
    </g>
    ${Object.keys(BOX).map(nodeSvg).join("")}
  </svg>`;
}

function connectionsOf(id) {
  return RELATIONSHIPS.filter(r => r.from === id || r.to === id || (id === "trimble" && r.to === "trimble"));
}

function renderDetail(id) {
  const t = T();
  const host = root.querySelector("[data-detail]");
  if (!host) return;
  const role = ROLES.find(r => r.id === id);
  const org = ORGANIZATIONS.find(o => o.id === id);
  const tool = TOOLS.find(x => x.id === id);
  let head = "", body = "";
  if (role) {
    const st = role.status === "planned" ? t.planned : t.current;
    head = `<div class="team-pills"><span class="team-pill ${role.status === "planned" ? "plan" : "cur"}">${esc(st)}</span>
      ${role.contractualBaseline ? `<span class="team-pill base">${esc(t.baseline)}</span>` : ""}
      <span class="team-pill">${esc(pct(role.allocationPct))}${role.plannedAllocationPct ? ` → ${esc(pct(role.plannedAllocationPct))} (${esc(t.planned.toLowerCase())})` : ""}</span></div>
      <h3>${esc(L(role.title))}${role.subtitle ? ` <small>· ${esc(L(role.subtitle))}</small>` : ""}</h3>`;
    body = `<h4>${esc(t.responsibilities)}</h4><ul>${duties(role).map(d => `<li>${esc(L(d))}</li>`).join("")}</ul>`;
  } else if (org) {
    head = `<div class="team-pills"><span class="team-pill ext">${esc(t.external)}</span></div><h3>${esc(L(org.name))} <small>· ${esc(L(org.role))}</small></h3>`;
    body = `<p>${esc(L(org.description))}</p>`;
  } else if (tool) {
    head = `<h3>${esc(tool.name)}</h3>`;
    body = `<p>${esc(L(tool.purpose))}</p>`;
  }
  const conns = connectionsOf(id).map(r => {
    const other = r.from === id ? r.to : r.from;
    return `<li><svg width="34" height="10" aria-hidden="true"><line class="e e-${r.type}" x1="1" x2="33" y1="5" y2="5"/></svg>
      <span>${esc(L(r.label))} – <b>${esc(nameOf(other))}</b>${r.status === "planned" ? ` <em>(${esc(t.planned.toLowerCase())})</em>` : ""}${r.note ? `<br><small>${esc(L(r.note))}</small>` : ""}</span></li>`;
  }).join("");
  const src = (role || org || tool)?.source;
  host.innerHTML = `${head}<div class="team-detail-grid"><div>${body}</div>
    <div><h4>${esc(t.connections)}</h4><ul class="team-conns">${conns}</ul>
    ${src ? `<p class="team-src">${esc(t.sourceLbl)}: ${esc(SOURCE.workbook)} · ${esc(src.cells)} · «${esc(src.label.trim())}»</p>` : ""}</div></div>`;
}

function mobileList() {
  const t = T();
  const card = id => {
    const role = ROLES.find(r => r.id === id);
    const org = ORGANIZATIONS.find(o => o.id === id);
    const pills = role
      ? `<span class="team-pill ${role.status === "planned" ? "plan" : "cur"}">${esc(role.status === "planned" ? t.planned : t.current)}</span><span class="team-pill">${esc(pct(role.allocationPct))}${role.plannedAllocationPct ? ` → ${esc(pct(role.plannedAllocationPct))}` : ""}</span>`
      : `<span class="team-pill ext">${esc(t.external)}</span>`;
    const conns = connectionsOf(id).filter(r => r.type !== "data").map(r => {
      const other = r.from === id ? r.to : r.from;
      return `<li><svg width="26" height="10" aria-hidden="true"><line class="e e-${r.type}" x1="1" x2="25" y1="5" y2="5"/></svg>${esc(L(r.label))} – ${esc(nameOf(other))}</li>`;
    }).join("");
    return `<div class="team-mcard ${role ? (role.status === "planned" ? "m-plan" : "m-cur") : "m-ext"}" data-node="${id}" role="button" tabindex="0" aria-pressed="${selected === id}">
      <span class="team-pills">${pills}</span>
      <strong>${esc(nameOf(id))}</strong>${role?.subtitle ? `<span class="team-msub">${esc(L(role.subtitle))}</span>` : org ? `<span class="team-msub">${esc(L(org.role))}</span>` : ""}
      <ul>${conns}</ul></div>`;
  };
  return `<div class="team-mgroup"><h3>${esc(t.external)}</h3>${["ohla", "svv"].map(card).join("")}</div>
    <div class="team-mgroup team-mnorma"><h3>NORMA Geosystems</h3>${["lead", "qs", "field1", "field2", "tunnel"].map(card).join("")}</div>
    <div class="team-mgroup"><h3>${esc(t.external)}</h3>${card("metrostav")}</div>
    <div class="team-mband"><strong>${esc(t.trimbleBand)}</strong><span>${esc(t.trimbleSub)}</span></div>`;
}

function relationsTable() {
  const t = T();
  const rows = RELATIONSHIPS.map(r => `<tr>
    <td>${esc(nameOf(r.from))}</td><td>${esc(nameOf(r.to))}</td>
    <td><svg width="30" height="10" aria-hidden="true"><line class="e e-${r.type}" x1="1" x2="29" y1="5" y2="5"/></svg> ${esc(t.types[r.type])}</td>
    <td>${esc(L(r.label))}</td><td>${esc(r.status === "planned" ? t.planned : t.current)}</td>
    <td class="cells">${esc(r.source?.workbook || "")} [${esc(r.source?.ref || "")}]</td></tr>`).join("");
  return `<div class="fin-table-wrap"><table class="fin-table team-rel">
    <thead><tr><th>${esc(t.from)}</th><th>${esc(t.to)}</th><th>${esc(t.type)}</th><th>${esc(t.label)}</th><th>${esc(t.status)}</th><th>${esc(t.sourceLbl)}</th></tr></thead>
    <tbody>${rows}</tbody></table></div>
    <div class="team-notes"><h4>${esc(t.notesTitle)}</h4><ul>${NOTES.map(n => `<li>${esc(L(n))}</li>`).join("")}</ul>
    <p class="team-src">${esc(tpl(t.notesSrc, { wb: SOURCE.workbook, sheet: SOURCE.sheet, rpt: SOURCE.report }))} WB = ${esc(SOURCE.workbook)}, RPT = ${esc(SOURCE.report)}, RES = Ressurser.</p></div>`;
}

/* ---------------- C – development ---------------- */
function stages() {
  const t = T();
  const label = s => (s.status === "planned" ? t.planned : s.status === "current" ? t.current : t.baseline);
  return `<section class="section gray" aria-labelledby="team-c"><div class="wrap">
    <div class="eyebrow">${esc(t.cEb)}</div>
    <h2 class="sec-title" id="team-c">${esc(t.cTitle)}</h2>
    <p class="team-lede">${esc(t.cLede)}</p>
    <ol class="team-stages">${STAGES.map((s, i) => `<li class="card team-stage st-${s.status}">
      <div class="team-stage-top"><span class="team-stage-n">${esc(t.stage)} ${i + 1}</span><span class="team-pill ${s.status === "planned" ? "plan" : s.status === "current" ? "cur" : "base"}">${esc(label(s))}</span></div>
      <h3>${esc(L(s.title))}</h3>
      <p>${esc(L(s.text))}</p>
      <ul class="team-stage-roles">${s.roles.map(id => {
        const r = ROLES.find(x => x.id === id);
        return `<li class="${r.status === "planned" ? "plan" : ""}">${esc(L(r.title))} <span>${esc(pct(r.allocationPct))}</span></li>`;
      }).join("")}${s.id === "planned" ? `<li class="plan">${esc(lang === "en" ? "Day shift 1 and 2" : "Dagsone 1 og 2")} <span>75 % → 100 %</span></li>` : ""}</ul>
    </li>`).join("")}</ol>
  </div></section>`;
}

/* ---------------- D – technical collaboration ---------------- */
function collaboration() {
  const t = T();
  const group = g => TOOLS.filter(x => x.group === g).map(x => `<li><strong>${esc(x.name)}</strong><span>${esc(L(x.purpose))}</span></li>`).join("");
  return `<section class="section" aria-labelledby="team-d"><div class="wrap">
    <div class="eyebrow">${esc(t.dEb)}</div>
    <h2 class="sec-title" id="team-d">${esc(t.dTitle)}</h2>
    <div class="team-collab">
      <div class="card team-ref">
        <h3>${esc(t.refTitle)}</h3>
        <p>${esc(t.refText)}</p>
        <ol class="team-flow">${REFERENCE_NETWORK.map(s => `<li>${esc(L(s))}</li>`).join("")}</ol>
      </div>
      <div class="card team-tools">
        <h3>${esc(t.toolsTitle)}</h3>
        <div class="team-tool-groups">
          <div><h4>${esc(t.processing)}</h4><ul>${group("processing")}</ul></div>
          <div class="team-platform"><h4>${esc(t.platform)}</h4><ul>${group("platform")}</ul></div>
        </div>
        <p class="team-src">${esc(t.toolsNote)}</p>
      </div>
    </div>
  </div></section>`;
}

/* ---------------- E – continuity ---------------- */
function continuity() {
  const t = T();
  return `<section class="section gray team-cont-sec" aria-labelledby="team-e"><div class="wrap">
    <div class="card team-cont">
      <div class="eyebrow">${esc(t.eEb)}</div>
      <h2 id="team-e">${esc(t.eTitle)}</h2>
      <div class="team-cont-grid">
        <p>${esc(L(CONTINUITY.text))}</p>
        <ul>${CONTINUITY.points.map(p => `<li>${esc(L(p))}</li>`).join("")}</ul>
      </div>
    </div>
  </div></section>`;
}

/* ---------------- interaction ---------------- */
function highlight(id) {
  const svg = root.querySelector(".team-svg");
  if (!svg) return;
  svg.classList.toggle("is-focus", !!id);
  svg.querySelectorAll(".edge").forEach(e => {
    const on = id && (e.dataset.from === id || e.dataset.to === id);
    e.classList.toggle("on", !!on);
  });
  svg.querySelectorAll(".node").forEach(n => n.classList.toggle("on", n.dataset.node === id));
}

function select(id) {
  selected = id; interacted = true;
  root.querySelectorAll("[data-node]").forEach(n => n.setAttribute("aria-pressed", n.dataset.node === id));
  renderDetail(id);
  highlight(id);
}

function bind() {
  root.querySelectorAll("[data-node]").forEach(n => {
    n.addEventListener("click", () => select(n.dataset.node));
    n.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); select(n.dataset.node); } });
    n.addEventListener("pointerenter", () => highlight(n.dataset.node));
    n.addEventListener("focus", () => highlight(n.dataset.node));
    n.addEventListener("pointerleave", () => highlight(interacted ? selected : null));
    n.addEventListener("blur", () => highlight(interacted ? selected : null));
  });
  highlight(interacted ? selected : null);
}
