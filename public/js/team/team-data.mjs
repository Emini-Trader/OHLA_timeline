/**
 * Teamstruktur – normalized dataset (no UI code).
 *
 * Sources
 *  [WB]  NORMA_struktura-survey team.xlsx, sheet "Ark1" (organizational diagram drawn with
 *        merged cells and cell borders). Every node keeps the original cell label and range.
 *  [RPT] Organizational report supplied with the task (roles, responsibilities, stages,
 *        cooperation, continuity). Where it clarifies the status of a workbook item the
 *        clarification is applied and recorded in `notes`.
 *  [RES] Existing resource overview (Ressurser tab) – field surveyor duties.
 *
 * Percentages are the resource allocations shown in the workbook. They are not contractual
 * minimums, total employment percentages or guaranteed physical presence, and must not be
 * summed into a headcount.
 */

export const SOURCE = Object.freeze({
  workbook: "NORMA_struktura-survey team.xlsx",
  sheet: "Ark1",
  report: "Organisasjonsrapport (oppgavebeskrivelse)",
  project: "E105 Gjønnestunnelen",
});

/** Organizations. `internal: true` only for NORMA. */
export const ORGANIZATIONS = [
  {
    id: "norma", internal: true,
    name: { no: "NORMA Geosystems", en: "NORMA Geosystems" },
    role: { no: "Landmålingstjenester", en: "Surveying services" },
  },
  {
    id: "ohla", internal: false, kind: "contractor",
    name: { no: "OHLA", en: "OHLA" },
    role: { no: "Totalentreprenør", en: "Main contractor" },
    description: {
      no: "Ansvarlig for byggeaktivitetene og prosjektkoordineringen.",
      en: "Responsible for construction activities and project coordination.",
    },
    source: { cells: "L1:Q3", label: "OHLA" },
  },
  {
    id: "svv", internal: false, kind: "client",
    name: { no: "SVV – Statens vegvesen", en: "SVV – Norwegian Public Roads Administration" },
    role: { no: "Byggherre", en: "Project owner / client" },
    description: { no: "Prosjektets byggherre.", en: "The project owner and client." },
    source: { cells: "S1:U3", label: "SVV" },
  },
  {
    id: "metrostav", internal: false, kind: "collaborator",
    name: { no: "METROSTAV", en: "METROSTAV" },
    role: { no: "Landmålingsteam", en: "Surveying team" },
    description: {
      no: "Eksternt samarbeidende landmålingsteam. Nært samarbeid med NORMAs stikningsleder om prosjektets referansenett.",
      en: "External cooperating surveying team. Close cooperation with NORMA's Lead Surveyor on the project's reference network.",
    },
    // The workbook label contains "100%". It is kept for traceability only: it is not an
    // additional NORMA resource and its contractual meaning is not stated in the sources.
    source: { cells: "L20:Q22", label: "METROSTAV 100%" },
  },
];

/** NORMA roles (resources). status: "current" | "planned". */
export const ROLES = [
  {
    id: "lead", org: "norma", status: "current", allocationPct: 100, contractualBaseline: true,
    title: { no: "Stikningsleder", en: "Lead Surveyor" },
    responsibilities: [
      { no: "Overordnet koordinering og oppfølging av landmålingen", en: "Overall surveying coordination and supervision" },
      { no: "Planlegging og teknisk forberedelse", en: "Planning and technical preparation" },
      { no: "Kvalitetssikring og kontroll av landmålingsarbeidet", en: "Quality assurance and control of surveying activities" },
      { no: "Koordinering av prosjektdata og landmålingsressurser", en: "Coordination of project data and surveying resources" },
      { no: "Teknisk støtte til byggeoperasjonene", en: "Technical support to construction operations" },
    ],
    source: { cells: "L8:Q10", label: "LEAD SURVEY 100%", ref: "WB+RPT" },
  },
  {
    id: "qs", org: "norma", status: "current", allocationPct: 50, contractualBaseline: true,
    title: { no: "Mengdeberegner / GK", en: "Quantity Surveyor / GK" },
    subtitle: { no: "Kontorarbeid", en: "Office work" },
    responsibilities: [
      { no: "Beregninger og databehandling", en: "Calculations and data processing" },
      { no: "Geometrisk kontroll og verifisering", en: "Geometric control and verification" },
      { no: "Dokumentasjon og rapportering", en: "Documentation and reporting" },
      { no: "Landmålingsfaglig teknisk kommunikasjon med SVV", en: "Surveying-related technical communication with SVV" },
    ],
    source: { cells: "S8:U10", label: "OFFICE WORK 50%", ref: "WB+RPT" },
  },
  {
    id: "field1", org: "norma", status: "current", allocationPct: 75,
    plannedAllocationPct: 100, // RPT stage 3: potential increase, depending on project needs
    title: { no: "Feltlandmåler – dagsone 1", en: "Field Surveyor – Day Shift 1" },
    shortTitle: { no: "Dagsone 1", en: "Day shift 1" }, group: { no: "Feltlandmåler", en: "Field surveyor" },
    responsibilities: "field",
    source: { cells: "L12:P14 (+ Q12:Q14 grå)", label: " (dagsone) FIELDWORK 75%", ref: "WB+RPT" },
  },
  {
    id: "field2", org: "norma", status: "current", allocationPct: 75,
    plannedAllocationPct: 100,
    title: { no: "Feltlandmåler – dagsone 2", en: "Field Surveyor – Day Shift 2" },
    shortTitle: { no: "Dagsone 2", en: "Day shift 2" }, group: { no: "Feltlandmåler", en: "Field surveyor" },
    responsibilities: "field",
    source: { cells: "L16:P18 (+ Q16:Q18 grå)", label: "(dagsone) FIELDWORK 75%", ref: "WB+RPT" },
  },
  {
    id: "tunnel", org: "norma", status: "planned", allocationPct: 100,
    title: { no: "Feltlandmåler – tunnel (infrastruktur)", en: "Field Surveyor – Tunnel (infrastructure)" },
    shortTitle: { no: "Tunnel – infrastruktur", en: "Tunnel – infrastructure" }, group: { no: "Feltlandmåler", en: "Field surveyor" },
    responsibilities: [
      { no: "Infrastrukturmålinger inne i tunnelen (foreslått)", en: "Infrastructure measurements inside the tunnel (proposed)" },
    ],
    source: { cells: "L24:Q26", label: "(tunnel) FIELDWORK 100%", ref: "WB+RPT" },
  },
];

/** Field surveyor duties as listed in the resource overview [RES]. */
export const FIELD_DUTIES = [
  { no: "Utstikking av linjer, punkter og profiler", en: "Setting-out of lines, points and profiles" },
  { no: "As-built målinger og nødvendig dokumentasjon", en: "As-built surveys and required documentation" },
  { no: "Løpende fremdrifts- og kvalitetskontroll", en: "Ongoing progress and quality control" },
  { no: "Etablering, måling og vedlikehold av grunnlagsnett", en: "Establishment, measurement and maintenance of the control network" },
  { no: "Fremdrifts- og deformasjonskontroll i tunnel", en: "Progress and deformation monitoring in the tunnel" },
];

/**
 * Relationships. Types:
 *  internal      – coordination within the NORMA team (not an external reporting line)
 *  coordination  – operational coordination with the main contractor
 *  cooperation   – technical cooperation with an external surveying team
 *  communication – surveying-related technical communication with the client
 *  contract      – client–contractor context (outside NORMA's scope)
 *  data          – technical data exchange
 *  backup        – temporary operational backup (not additional capacity)
 */
export const RELATIONSHIP_TYPES = ["internal", "coordination", "cooperation", "communication", "contract", "data", "backup"];

export const RELATIONSHIPS = [
  { id: "ohla-svv", from: "ohla", to: "svv", type: "contract",
    label: { no: "Byggherre – totalentreprenør", en: "Client – main contractor" },
    source: { workbook: "black double line M1:R2", ref: "WB" } },
  { id: "ohla-lead", from: "ohla", to: "lead", type: "coordination",
    label: { no: "Operativ koordinering", en: "Operational coordination" },
    source: { workbook: "black line from OHLA to LEAD SURVEY (column N)", ref: "WB+RPT" } },
  { id: "svv-qs", from: "svv", to: "qs", type: "communication",
    label: { no: "Teknisk kommunikasjon (landmåling)", en: "Technical communication (surveying)" },
    note: { no: "Gjelder landmålingsfaglig kommunikasjon, dokumentasjon og koordinering – ikke all kommunikasjon mellom OHLA og SVV.",
      en: "Covers surveying-related communication, documentation and coordination – not all communication between OHLA and SVV." },
    source: { workbook: "black line from SVV to OFFICE WORK (column T)", ref: "WB+RPT" } },
  { id: "lead-qs", from: "lead", to: "qs", type: "internal",
    label: { no: "Intern koordinering", en: "Internal coordination" },
    source: { workbook: "black double line R8:R9", ref: "WB" } },
  { id: "lead-field1", from: "lead", to: "field1", type: "internal",
    label: { no: "Koordinering av feltarbeid", en: "Field work coordination" },
    source: { workbook: "black bracket column J", ref: "WB" } },
  { id: "lead-field2", from: "lead", to: "field2", type: "internal",
    label: { no: "Koordinering av feltarbeid", en: "Field work coordination" },
    source: { workbook: "black bracket column J", ref: "WB" } },
  { id: "lead-tunnel", from: "lead", to: "tunnel", type: "internal", status: "planned",
    label: { no: "Koordinering (planlagt)", en: "Coordination (planned)" },
    source: { workbook: "black bracket column J", ref: "WB" } },
  { id: "lead-metrostav", from: "lead", to: "metrostav", type: "cooperation",
    label: { no: "Samarbeid om referansenett", en: "Reference network cooperation" },
    source: { workbook: "black bracket column J (to METROSTAV)", ref: "WB+RPT" } },
  { id: "field1-qs", from: "field1", to: "qs", type: "data",
    label: { no: "Feltdata til bearbeiding", en: "Field data for processing" },
    source: { workbook: "green line row 12 → column S", ref: "WB" } },
  { id: "field2-qs", from: "field2", to: "qs", type: "data",
    label: { no: "Feltdata til bearbeiding", en: "Field data for processing" },
    source: { workbook: "green line row 16 → column S", ref: "WB" } },
  { id: "tunnel-qs", from: "tunnel", to: "qs", type: "data", status: "planned",
    label: { no: "Feltdata til bearbeiding (planlagt)", en: "Field data for processing (planned)" },
    source: { workbook: "green line row 24 → column S", ref: "WB" } },
  { id: "metrostav-qs", from: "metrostav", to: "qs", type: "data",
    label: { no: "Måledata (referansenett)", en: "Survey data (reference network)" },
    source: { workbook: "green line row 20 → column S", ref: "WB" } },
  { id: "norma-trimble", from: "norma", to: "trimble", type: "data",
    label: { no: "Datautveksling", en: "Data exchange" },
    source: { workbook: "red lines from TRIMBLE Connect Web (I5:I19) to all NORMA resources", ref: "WB+RPT" } },
  { id: "ohla-trimble", from: "ohla", to: "trimble", type: "data",
    label: { no: "Datautveksling", en: "Data exchange" },
    source: { workbook: "black line J4:N4 to OHLA", ref: "WB+RPT" } },
  { id: "metrostav-trimble", from: "metrostav", to: "trimble", type: "data",
    label: { no: "Datautveksling", en: "Data exchange" },
    source: { workbook: "red line to METROSTAV row 20", ref: "WB+RPT" } },
  { id: "backup-field1", from: "lead", to: "field1", type: "backup",
    label: { no: "Midlertidig reserve", en: "Temporary backup" }, source: { ref: "RPT" } },
  { id: "backup-field2", from: "lead", to: "field2", type: "backup",
    label: { no: "Midlertidig reserve", en: "Temporary backup" }, source: { ref: "RPT" } },
  { id: "backup-tunnel", from: "lead", to: "tunnel", type: "backup", status: "planned",
    label: { no: "Midlertidig reserve (tunnel)", en: "Temporary backup (tunnel)" }, source: { ref: "RPT" } },
  { id: "backup-metrostav", from: "lead", to: "metrostav", type: "backup", oneWay: true,
    label: { no: "Reserve: stikningsleder bistår METROSTAV ved behov", en: "Backup: Lead Surveyor occasionally assists METROSTAV" },
    note: { no: "Kun én vei – METROSTAV erstatter ikke stikningslederens oppgaver. METROSTAV forblir en ekstern samarbeidspartner, ikke en NORMA-ressurs.",
      en: "One-way only – METROSTAV does not substitute for the Lead Surveyor's duties. METROSTAV remains an external collaborator, not a NORMA resource." },
    source: { workbook: "not in workbook – added on the owner's instruction", ref: "OWNER" } },
];

/** Software referenced in the workbook (F5:I19) – grouped by function. */
export const TOOLS = [
  { id: "gisline", name: "GISLINE", group: "processing",
    purpose: { no: "Fastmerker beregning", en: "Fixed point calculations" },
    source: { cells: "F5:F19", label: "GISLINE" } },
  { id: "gemini", name: "Gemini", group: "processing",
    purpose: { no: "Landmålingsberegning og databehandling", en: "Survey calculations and data processing" },
    source: { cells: "H5:H19", label: "Gemini" } },
  { id: "autocad", name: "AutoCAD", group: "processing",
    purpose: { no: "CAD og tegningsgrunnlag", en: "CAD and drawing data" },
    source: { cells: "G5:G19", label: "AUTOCAD" } },
  { id: "tbc", name: "Trimble Business Center", group: "processing",
    purpose: { no: "Monitorering", en: "Monitoring" },
    source: { label: "Trimble Business Center", ref: "OWNER" } }, // not in workbook – added on the owner's instruction
  { id: "infinity", name: "Leica Infinity", group: "processing",
    purpose: { no: "Etterprosessering av punktskyer", en: "Point cloud post-processing" },
    source: { label: "Leica Infinity", ref: "OWNER" } }, // not in workbook – added on the owner's instruction
  { id: "trimble", name: "Trimble Connect (Web)", group: "platform",
    purpose: { no: "Felles skybasert plattform for BIM og datautveksling (NORMA/OHLA-teamet, inkl. METROSTAV)",
      en: "Shared cloud-based platform for BIM and data exchange (NORMA/OHLA team, incl. METROSTAV)" },
    source: { cells: "I5:I19", label: "TRIMBLE Connect Web" } },
];

/** Reference network cooperation (RPT). */
export const REFERENCE_NETWORK = [
  { no: "Planlegging og verifisering av referansenettet", en: "Planning and verification of the reference network" },
  { no: "Felles feltmålinger", en: "Joint field measurements" },
  { no: "Uavhengige beregninger i tre ulike programvaremiljøer", en: "Independent calculations in three different software environments" },
  { no: "Verifisering for pålitelige geometriske referansedata", en: "Verification aimed at reliable geometric reference data" },
];

/** Development stages – ordered sequence, no dates (none in the sources). */
export const STAGES = [
  {
    id: "baseline", status: "baseline",
    title: { no: "Kontraktsgrunnlag", en: "Contractual baseline" },
    text: {
      no: "Prosjektet startet med kjernefunksjonene stikningsleder og mengdeberegner definert i kontrakten.",
      en: "The project began with the core Lead Surveyor and Quantity Surveyor functions defined in the contract.",
    },
    roles: ["lead", "qs"],
  },
  {
    id: "current", status: "current",
    title: { no: "Utvidet feltdrift", en: "Expanded field operations" },
    text: {
      no: "Da byggeaktiviteten økte, ble feltorganisasjonen utvidet med to landmålere i dagsonen, hver med ca. 75 % ressursandel. Samtidig ble det teknisk samarbeidet med METROSTAV styrket, og landmålingsfaglig kommunikasjon med SVV samlet hos mengdeberegneren.",
      en: "As construction activity increased, the field organization expanded to two day-shift surveyors, each allocated approximately 75%. Technical coordination with METROSTAV was strengthened, and surveying-related communication with SVV was centralized through the Quantity Surveyor.",
    },
    roles: ["lead", "qs", "field1", "field2"],
  },
  {
    id: "planned", status: "planned",
    title: { no: "Planlagt utvikling", en: "Planned development" },
    text: {
      no: "Mulig tillegg av en feltlandmåler for infrastrukturmålinger i tunnelen (foreslått 100 %) og mulig økning av ressursandelen i dagsonen til 100 %, avhengig av prosjektets behov.",
      en: "Potential addition of a field surveyor for infrastructure measurements inside the tunnel (proposed 100%) and a potential increase of the day-shift allocation to 100%, depending on project needs.",
    },
    roles: ["tunnel"],
  },
];

export const CONTINUITY = {
  text: {
    no: "Stikningsleder er operativ reserve for feltarbeidet både i dagsonen og i tunnelen. Ved ekstraordinære situasjoner, som akutt sykdom eller uventet fravær, kan stikningsleder midlertidig gå inn i produksjonen for å sikre kontinuitet.",
    en: "The Lead Surveyor provides operational backup for field activities in both the day shift and tunnel operations. In exceptional circumstances, such as sudden illness or unexpected absence, the Lead Surveyor can temporarily step into surveying production to maintain continuity.",
  },
  points: [
    { no: "Hovedansvaret er fortsatt koordinering og teknisk oppfølging.", en: "The primary responsibility remains coordination and technical supervision." },
    { no: "Midlertidig reserve er ikke det samme som permanent ekstra feltkapasitet.", en: "Temporary backup is not the same as permanent additional field capacity." },
    { no: "Ordningen øker ikke ressursandelen som er tilgjengelig for prosjektet.", en: "The arrangement does not increase the resource allocation available to the project." },
    { no: "Den gir ikke ubegrenset tilgjengelighet eller samtidig dekning av flere arbeidsfronter.", en: "It does not imply unrestricted availability or simultaneous coverage of several work fronts." },
  ],
};

/** Interpretation notes – how the workbook was read, and what the report clarified. */
export const NOTES = [
  { no: "Arbeidsboken har ingen fargeforklaring. Svarte linjer er tolket som organisatoriske relasjoner, røde som datautveksling via Trimble Connect, grønne som feltdata til mengdeberegner/kontor.",
    en: "The workbook has no colour legend. Black lines are read as organizational relationships, red as data exchange via Trimble Connect, green as field data to the Quantity Surveyor/office." },
  { no: "«(tunnel) FIELDWORK 100%» (L24) vises som planlagt i henhold til rapporten (lysere fyll i arbeidsboken).",
    en: "“(tunnel) FIELDWORK 100%” (L24) is shown as planned per the report (lighter fill in the workbook)." },
  { no: "Grå felt Q12:Q14 og Q16:Q18 ved dagsone-boksene er tolket som den planlagte økningen fra 75 % til 100 %.",
    en: "Grey cells Q12:Q14 and Q16:Q18 next to the day-shift boxes are read as the planned increase from 75% to 100%." },
  { no: "«METROSTAV 100%» beholdes som kildeetikett, men vises ikke som NORMA-ressurs; den kontraktsmessige betydningen er ikke oppgitt.",
    en: "“METROSTAV 100%” is kept as a source label but not shown as a NORMA resource; its contractual meaning is not stated." },
  { no: "En linje fra Trimble Connect ender ved forbindelsen SVV–kontor (rad 6). Det er ikke tolket som at SVV bruker plattformen.",
    en: "One line from Trimble Connect ends at the SVV–office connector (row 6). It is not interpreted as SVV using the platform." },
  { no: "Reservelinjen fra stikningsleder til METROSTAV finnes ikke i arbeidsboken; den er lagt til etter avklaring med eieren. Den gjelder én vei: stikningsleder bistår av og til METROSTAV, mens METROSTAV aldri overtar stikningslederens oppgaver.",
    en: "The backup line from the Lead Surveyor to METROSTAV is not in the workbook; it was added after clarification with the owner. It is one-way: the Lead Surveyor occasionally assists METROSTAV, while METROSTAV never takes over the Lead Surveyor's duties." },
  { no: "Kildene sier ikke hvilke tre programvaremiljøer som brukes i de uavhengige beregningene; de er derfor ikke navngitt.",
    en: "The sources do not state which three software environments are used for the independent calculations, so they are not named." },
];
