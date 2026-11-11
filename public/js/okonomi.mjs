/**
 * Økonomi / Financials view.
 * Presentation only – formulas live in ./finance/calc.mjs and data is fetched
 * from the authenticated endpoint /api/financials (never bundled here).
 */
import {
  calculateProject, compareRateReduction, rateSensitivity,
  summarizeAccounting, summarizeRateModel,
  STATUTORY_DEFAULTS, OPEX_KEYS, PERSONNEL_COMPONENTS, toNumber,
} from "./finance/calc.mjs";

/* ------------------------------------------------------------------ */
/* Strings                                                             */
/* ------------------------------------------------------------------ */
const STR = {
  no: {
    kicker: "NORMA Geosystems AS · Økonomi", title: "Økonomi <span class=\"accent\">og lønnsomhet</span>",
    lead: "Regnskapstall, modellert prissammenligning og en interaktiv kalkulator for prosjektlønnsomhet. Faktiske tall, modeller og antakelser er tydelig merket.",
    loading: "Laster økonomidata …",
    loginEb: "Beskyttet område", loginTitle: "Logg inn for å se økonomidata",
    loginText: "Økonomidataene er konfidensielle. Tilgangen kontrolleres på serveren, og dataene lastes først etter innlogging.",
    password: "Passord", signIn: "Logg inn", signOut: "Logg ut", signingIn: "Logger inn …",
    errBadPw: "Feil passord.", errThrottle: "For mange forsøk. Prøv igjen om 15 minutter.",
    errNotConfigured: "Innlogging er ikke konfigurert på serveren. Økonomidata vises ikke før tilgangskontroll er satt opp.",
    errNetwork: "Kunne ikke kontakte serveren. Økonomidelen krever API-et (Vercel eller «npm run dev»).",
    errData: "Datasettet på serveren er ugyldig. Kontakt administrator.", errGeneric: "Noe gikk galt.", retry: "Prøv igjen",
    sampleBadge: "Eksempeldata – ikke reelle tall", realBadge: "Regnskapsdata", protectedBadge: "Innlogget",
    sampleNote: "Serveren har ingen reelle data konfigurert. Alle tall på denne siden er syntetiske eksempeltall for layout og testing.",
    kRevenue: "Driftsinntekter", kCosts: "Driftskostnader", kResult: "Driftsresultat", kMargin: "Driftsmargin",
    kRevenueSub: "Salgsinntekter, sum", kCostsSub: "Lønn + annen drift", kResultSub: "Inntekter − kostnader", kMarginSub: "Resultat / inntekter",
    aEb: "A · Faktiske regnskapstall", aTitle: "Økonomisk resultat",
    aNote: "Regnskapstall fra arbeidsboken (fane {sheet}). Arbeidsboken viser ikke at tallene gjelder OHLA-kontrakten alene, derfor presenteres de som selskapets driftsresultat for perioden – ikke som lønnsomheten i OHLA-prosjektet.",
    period: "Periode", chartRevCost: "Inntekter og kostnader per måned", chartResult: "Driftsresultat per måned",
    sRevenue: "Driftsinntekter", sCosts: "Driftskostnader", sResult: "Driftsresultat",
    tableToggle: "Vis kategorier og månedsbeløp", tableHide: "Skjul tabell", category: "Kategori", total: "Sum", cells: "Celler",
    personnel: "Lønnskostnad", other: "Annen driftskostnad",
    bEb: "B · Modellert kostnadssammenligning", bTitle: "Timepriser: NORMA mot referansemodell",
    bBadgeModel: "Modell – ikke regnskap", bBadgeAssump: "Referansesatser = antakelser i arbeidsboken",
    bNorma: "NORMA-modell per måned", bRef: "Referansemodell per måned", bDiff: "Differanse per måned", bDiffPct: "Differanse i % av referanse",
    chartRates: "Månedsbeløp per tjeneste (sats × timer)", legNorma: "NORMA-sats", legRef: "Referansesats",
    service: "Tjeneste", contract: "Kontrakt", normaRate: "NORMA-sats", refRate: "Referansesats", hours: "Timer/mnd",
    normaAmt: "NORMA-beløp", refAmt: "Referansebeløp", diff: "Differanse",
    method: "Metode", methodText: "For hver tjeneste beregnes månedsbeløp = timepris × antall timer. Arbeidsboken bruker 165 timer per måned for hver av de fire hovedtjenestene, 80 timer for geometrisk monitorering og 20 timer for prosjekteringsstøtte. Kolonnen «MARKED» i arbeidsboken er her kalt referansesats: det er antakelser lagt inn i arbeidsboken, ikke uavhengig verifiserte norske markedssnitt. Alle beløp i NOK eks. mva.",
    invoiceTitle: "Faktisk fakturering (holdes adskilt fra modellen)",
    invoiceAvg: "Gjennomsnittlig fakturabeløp (manuelt angitt i arbeidsboken, {cell})",
    invoiceAcc: "Gjennomsnittlige salgsinntekter per måned i regnskapet",
    invoiceNote: "Modellbeløpet ovenfor er en hypotetisk sammenligning av priser – ikke fakturerte eller bokførte beløp.",
    cEb: "C · Kalkulator", cTitle: "Prosjektlønnsomhet",
    cNote: "Endringer her påvirker ikke regnskapstallene ovenfor. Felt med hvit bakgrunn er redigerbare antakelser; grå verdier er beregnet.",
    preset: "Utgangspunkt", presetBlank: "Tom mal (kun lovfestede satser)", presetGroup: "Historiske regneark – redigerbare antakelser",
    presetBanner: "Historisk antakelse fra regnearket «{sheet}». Verdiene må vurderes for hvert prosjekt før bruk.",
    wbCheck: "Kontroll mot arbeidsboken", wbTotal: "Total kostnad i arbeidsboken", wbExcluded: "Arbeidsbokens delsum utelater {v} (bl.a. arbeidsklær) – korrigert her.",
    revenue: "Inntekter", modeHourly: "Timepris", modeFixed: "Fast månedsbeløp",
    hourlyRate: "Timepris (NOK)", billableHours: "Fakturerbare timer per måned (prosjekt totalt)", fixedFee: "Fast månedsbeløp (NOK)",
    hoursHint: "Timene gjelder prosjektet samlet. Ved rotasjon (f.eks. 14/14) øker ikke timene automatisk med antall ansatte.",
    personnelIn: "Personell", hp: "Feriepenger (%)", aga: "Arbeidsgiveravgift (%)", otp: "OTP (%)",
    inclHp: "Årslønn inkluderer feriepenger (unngår dobbeltelling)",
    employee: "Ansatt", annualSalary: "Årslønn (NOK)", addEmp: "+ Legg til ansatt", remove: "Fjern",
    opexIn: "Driftskostnader per måned (NOK)",
    opex: { accounting: "Regnskap og administrasjon", insurance: "Forsikring", equipment: "Utstyr og programvare", vehicle: "Bil",
      phone: "Telefon og kommunikasjon", workwear: "Arbeidsklær", travel: "Reiser", accommodation: "Opphold og diett", other: "Andre prosjektkostnader" },
    out: "Resultat per måned", oRevenue: "Inntekter", oPersonnel: "Personalkostnader", oOpex: "Driftskostnader", oTotal: "Totale prosjektkostnader",
    oResult: "Estimert prosjektresultat", oResultSub: "Før selskapets felleskostnader og skatt – ikke nettoresultat",
    oMargin: "Prosjektmargin", oMarginSub: "Resultat / inntekter", oMarkup: "Påslag", oMarkupSub: "Resultat / kostnader",
    oBreakEven: "Nullpunkt-timepris", oBreakEvenSub: "Kostnader / fakturerbare timer", oBreakEvenFixed: "Nullpunkt (månedsbeløp)",
    perHour: "NOK/t", structure: "Kostnadsstruktur",
    comp: { base: "Lønn (årslønn / 12)", holidayPay: "Feriepenger", agaSalary: "AGA på lønn", agaHoliday: "AGA på feriepenger", otp: "OTP", agaOtp: "AGA på OTP" },
    struct: { base: "Lønn", holidayPay: "Feriepenger", social: "AGA og OTP", opex: "Driftskostnader" },
    personnelTable: "Personalkostnader per komponent", perEmployee: "Per ansatt",
    scen: "Scenario: redusert pris", reduction: "Reduksjon (%)", current: "Nåværende", reduced: "Redusert", change: "Endring",
    scenNote: "Samme timer og kostnader i begge kolonner. Kun prisen endres.",
    sens: "Sensitivitet for pris", price: "Pris", margin: "Margin",
    pp: "p.p.", none: "–", positive: "Positivt", negative: "Negativt",
    months: ["Januar", "Februar", "Mars", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Desember"],
    contractNames: { "HOVED KONTRAKT": "Hovedkontrakt", "FOTOGRAMETRI KONTRAKT": "Fotogrammetrikontrakt", "UTEN KONTRAKT": "Utenfor kontrakt" },
    services: { lead: "Stikningsleder (lead survey)", office: "Kontorarbeid", field: "Feltarbeid", drone: "Drone / Panorama 360", monitoring: "Geometrisk monitorering", design: "Prosjekteringsstøtte (tillegg)" },
  },
  en: {
    kicker: "NORMA Geosystems AS · Financials", title: "Financials <span class=\"accent\">and profitability</span>",
    lead: "Accounting figures, a modelled price comparison and an interactive project profitability calculator. Actual figures, models and assumptions are clearly labelled.",
    loading: "Loading financial data …",
    loginEb: "Protected area", loginTitle: "Sign in to view financial data",
    loginText: "The financial data is confidential. Access is checked on the server, and the data is loaded only after sign-in.",
    password: "Password", signIn: "Sign in", signOut: "Sign out", signingIn: "Signing in …",
    errBadPw: "Wrong password.", errThrottle: "Too many attempts. Try again in 15 minutes.",
    errNotConfigured: "Sign-in is not configured on the server. Financial data is not shown until access control is set up.",
    errNetwork: "Could not reach the server. The financial section requires the API (Vercel or “npm run dev”).",
    errData: "The dataset on the server is invalid. Contact the administrator.", errGeneric: "Something went wrong.", retry: "Try again",
    sampleBadge: "Sample data – not real figures", realBadge: "Accounting data", protectedBadge: "Signed in",
    sampleNote: "No real data is configured on the server. All figures on this page are synthetic sample values for layout and testing.",
    kRevenue: "Operating revenue", kCosts: "Operating expenses", kResult: "Operating result", kMargin: "Operating margin",
    kRevenueSub: "Sales revenue, total", kCostsSub: "Payroll + other operating", kResultSub: "Revenue − expenses", kMarginSub: "Result / revenue",
    aEb: "A · Actual accounting data", aTitle: "Financial performance",
    aNote: "Accounting figures from the workbook (sheet {sheet}). The workbook does not show that these figures relate to the OHLA contract alone, so they are presented as the company's operating result for the period – not as the profitability of the OHLA project.",
    period: "Period", chartRevCost: "Revenue and expenses per month", chartResult: "Operating result per month",
    sRevenue: "Operating revenue", sCosts: "Operating expenses", sResult: "Operating result",
    tableToggle: "Show categories and monthly amounts", tableHide: "Hide table", category: "Category", total: "Total", cells: "Cells",
    personnel: "Payroll costs", other: "Other operating expenses",
    bEb: "B · Modelled cost comparison", bTitle: "Hourly rates: NORMA vs. reference model",
    bBadgeModel: "Model – not accounting", bBadgeAssump: "Reference rates = workbook assumptions",
    bNorma: "NORMA model per month", bRef: "Reference model per month", bDiff: "Difference per month", bDiffPct: "Difference as % of reference",
    chartRates: "Monthly amount per service (rate × hours)", legNorma: "NORMA rate", legRef: "Reference rate",
    service: "Service", contract: "Contract", normaRate: "NORMA rate", refRate: "Reference rate", hours: "Hours/mo",
    normaAmt: "NORMA amount", refAmt: "Reference amount", diff: "Difference",
    method: "Method", methodText: "For each service, monthly amount = hourly rate × hours. The workbook uses 165 hours per month for each of the four main services, 80 hours for geometric monitoring and 20 hours for design support. The workbook column “MARKED” is called the reference rate here: these are assumptions entered in the workbook, not independently verified Norwegian market averages. All amounts in NOK excl. VAT.",
    invoiceTitle: "Actual invoicing (kept separate from the model)",
    invoiceAvg: "Average invoice amount (entered manually in the workbook, {cell})",
    invoiceAcc: "Average monthly sales revenue in the accounts",
    invoiceNote: "The model amount above is a hypothetical price comparison – not invoiced or booked amounts.",
    cEb: "C · Calculator", cTitle: "Project profitability",
    cNote: "Changes here do not affect the accounting figures above. Fields with a white background are editable assumptions; grey values are calculated.",
    preset: "Starting point", presetBlank: "Blank template (statutory rates only)", presetGroup: "Historical worksheets – editable assumptions",
    presetBanner: "Historical assumption from the worksheet “{sheet}”. Review the values for each project before use.",
    wbCheck: "Check against the workbook", wbTotal: "Total cost in the workbook", wbExcluded: "The workbook subtotal omits {v} (e.g. workwear) – corrected here.",
    revenue: "Revenue", modeHourly: "Hourly rate", modeFixed: "Fixed monthly fee",
    hourlyRate: "Hourly rate (NOK)", billableHours: "Billable hours per month (project total)", fixedFee: "Fixed monthly fee (NOK)",
    hoursHint: "Hours apply to the project as a whole. With rotation (e.g. 14/14), hours do not increase automatically with the number of employees.",
    personnelIn: "Personnel", hp: "Holiday pay (%)", aga: "Employer contribution, AGA (%)", otp: "Pension, OTP (%)",
    inclHp: "Annual salary includes holiday pay (avoids double counting)",
    employee: "Employee", annualSalary: "Annual salary (NOK)", addEmp: "+ Add employee", remove: "Remove",
    opexIn: "Operating expenses per month (NOK)",
    opex: { accounting: "Accounting and administration", insurance: "Insurance", equipment: "Equipment and software", vehicle: "Vehicle",
      phone: "Telephone and communications", workwear: "Workwear", travel: "Travel", accommodation: "Accommodation and subsistence", other: "Other project-related costs" },
    out: "Monthly result", oRevenue: "Revenue", oPersonnel: "Personnel costs", oOpex: "Operating expenses", oTotal: "Total project costs",
    oResult: "Estimated project result", oResultSub: "Before corporate overhead and tax – not net profit",
    oMargin: "Project margin", oMarginSub: "Result / revenue", oMarkup: "Markup", oMarkupSub: "Result / costs",
    oBreakEven: "Break-even hourly rate", oBreakEvenSub: "Costs / billable hours", oBreakEvenFixed: "Break-even (monthly fee)",
    perHour: "NOK/h", structure: "Cost structure",
    comp: { base: "Salary (annual / 12)", holidayPay: "Holiday pay", agaSalary: "AGA on salary", agaHoliday: "AGA on holiday pay", otp: "OTP", agaOtp: "AGA on OTP" },
    struct: { base: "Salary", holidayPay: "Holiday pay", social: "AGA and OTP", opex: "Operating expenses" },
    personnelTable: "Personnel costs by component", perEmployee: "Per employee",
    scen: "Scenario: reduced price", reduction: "Reduction (%)", current: "Current", reduced: "Reduced", change: "Change",
    scenNote: "Same hours and costs in both columns. Only the price changes.",
    sens: "Price sensitivity", price: "Price", margin: "Margin",
    pp: "pp", none: "–", positive: "Positive", negative: "Negative",
    months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    contractNames: { "HOVED KONTRAKT": "Main contract", "FOTOGRAMETRI KONTRAKT": "Photogrammetry contract", "UTEN KONTRAKT": "Outside contract" },
    services: { lead: "Lead survey", office: "Office work", field: "Fieldwork", drone: "Drone / Panorama 360", monitoring: "Geometric monitoring", design: "Additional design support" },
  },
};

const ACCOUNT_EN = {
  "5000": "Salaries to employees", "5020": "Holiday pay", "5400": "Employer's contribution (AGA)",
  "5401": "AGA on accrued holiday pay", "5910": "Canteen costs", "5920": "Occupational injury insurance",
  "5942": "LO/NHO (AFP)", "5945": "Employee pension insurance", "5990": "Other personnel costs",
  "6300": "Rent of premises (site barracks)", "6410": "Rent of fixtures and equipment", "6420": "Rent of IT systems",
  "6440": "Rent of vehicles", "6490": "Other rental costs", "6570": "Workwear and protective equipment",
  "6701": "Audit fee", "6705": "Accounting fee", "7000": "Fuel, company vehicles",
  "7020": "Maintenance, company vans", "7021": "Maintenance, company cars", "7040": "Insurance, company vehicles",
  "7090": "Other costs, company vehicles", "7140": "Travel expenses, non-reportable", "7500": "Insurance premiums",
};

/* ------------------------------------------------------------------ */
/* State                                                               */
/* ------------------------------------------------------------------ */
let root = null;
let lang = "no";
const state = {
  status: "idle", // idle | loading | login | ready | error
  error: null, loginError: null, busy: false,
  data: null, authRequired: false,
  presetId: "blank", calc: blankInput(), reductionPct: 20,
};

function blankInput() {
  return {
    revenueMode: "hourly", hourlyRate: 0, billableHours: 0, fixedFee: 0,
    rates: { ...STATUTORY_DEFAULTS }, salaryIncludesHolidayPay: false,
    employees: [{ name: "", annualSalary: 0 }],
    opex: Object.fromEntries(OPEX_KEYS.map(k => [k, 0])),
  };
}
const clone = o => JSON.parse(JSON.stringify(o));

/* ------------------------------------------------------------------ */
/* Formatting                                                          */
/* ------------------------------------------------------------------ */
const T = () => STR[lang];
const locale = () => (lang === "en" ? "en-GB" : "nb-NO");
const fmt = (v, d = 0) => new Intl.NumberFormat(locale(), { minimumFractionDigits: d, maximumFractionDigits: d }).format(v);
const nok = (v, d = 0) => (v === null || v === undefined || !Number.isFinite(v) ? T().none : `${fmt(v, d)} NOK`);
const signedNok = (v, d = 0) => (v === null ? T().none : (v > 0 ? "+" : "") + nok(v, d));
const pct = (v, d = 1) => (v === null || v === undefined ? T().none : `${fmt(v, d)} %`);
const signedPp = v => (v === null ? T().none : `${v > 0 ? "+" : ""}${fmt(v, 1)} ${T().pp}`);
const compact = v => {
  const a = Math.abs(v);
  if (a >= 1e6) return `${fmt(v / 1e6, 1)} M`;
  if (a >= 1e3) return `${fmt(v / 1e3, 0)}k`;
  return fmt(v, 0);
};
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const tpl = (s, vars) => s.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? "");
const monthName = key => T().months[Number(key.slice(5, 7)) - 1] || key;
const monthShort = key => monthName(key).slice(0, 3);
const signClass = v => (v > 0 ? "pos" : v < 0 ? "neg" : "");

/* ------------------------------------------------------------------ */
/* Lifecycle                                                           */
/* ------------------------------------------------------------------ */
export function show(container) {
  lang = window.OHLA?.lang || document.documentElement.lang || "no";
  if (!root) {
    root = container;
    document.addEventListener("ohla:lang", e => { lang = e.detail.lang; if (root) render(); });
    setupTooltip();
  }
  if (state.status === "idle") load(); else render();
}

async function load() {
  state.status = "loading"; render();
  try {
    const r = await fetch("/api/financials", { credentials: "same-origin", headers: { Accept: "application/json" }, cache: "no-store" });
    const body = await r.json().catch(() => ({}));
    if (r.status === 401) { state.status = "login"; }
    else if (r.ok && body.data) { state.data = body.data; state.authRequired = !!body.authRequired; state.status = "ready"; }
    else { state.status = "error"; state.error = body.error || `http_${r.status}`; }
  } catch {
    state.status = "error"; state.error = "network";
  }
  render();
}

async function login(password) {
  state.busy = true; state.loginError = null; render();
  try {
    const r = await fetch("/api/login", {
      method: "POST", credentials: "same-origin",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ password }),
    });
    const body = await r.json().catch(() => ({}));
    state.busy = false;
    if (r.ok) { await load(); return; }
    state.loginError = body.error === "too_many_attempts" ? "errThrottle"
      : body.error === "auth_not_configured" ? "errNotConfigured" : "errBadPw";
  } catch {
    state.busy = false; state.loginError = "errNetwork";
  }
  render();
}

async function logout() {
  try { await fetch("/api/logout", { method: "POST", credentials: "same-origin" }); } catch { /* ignore */ }
  // Drop confidential data from memory.
  state.data = null; state.presetId = "blank"; state.calc = blankInput(); state.status = "idle";
  load();
}

/* ------------------------------------------------------------------ */
/* Render                                                              */
/* ------------------------------------------------------------------ */
function render() {
  if (!root) return;
  const t = T();
  if (state.status === "loading" || state.status === "idle") {
    root.innerHTML = hero(null) + `<div class="fin"><div class="wrap fin-msg"><p>${esc(t.loading)}</p></div></div>`;
    return;
  }
  if (state.status === "login") { root.innerHTML = hero(null) + loginView(); bindLogin(); return; }
  if (state.status === "error") {
    const msg = { network: t.errNetwork, auth_not_configured: t.errNotConfigured, dataset_invalid: t.errData }[state.error] || t.errGeneric;
    root.innerHTML = hero(null) + `<div class="fin"><div class="wrap fin-msg"><div class="card fin-alert" role="alert"><p>${esc(msg)}</p>
      <button class="btn" type="button" data-act="retry">${esc(t.retry)}</button></div></div></div>`;
    root.querySelector('[data-act="retry"]').onclick = () => load();
    return;
  }
  try {
    const d = state.data;
    const acc = summarizeAccounting(d.accounting);
    const rm = summarizeRateModel(d.rateModel);
    root.innerHTML = hero(acc) + `<div class="fin">${sectionA(acc)}${sectionB(rm, acc)}${sectionC()}</div>`;
    bindDashboard();
    bindCalculator();
    renderCalcOutputs();
  } catch (err) {
    console.error(err);
    state.status = "error"; state.error = "render";
    render();
  }
}

function hero(acc) {
  const t = T();
  const d = state.data;
  let badge = "", kpis = "", actions = "";
  if (acc && d) {
    const months = d.accounting.months;
    const range = `${monthName(months[0].key)}–${monthName(months[months.length - 1].key).toLowerCase()} ${months[0].key.slice(0, 4)}`;
    badge = d.dataset === "sample"
      ? `<div class="badge-live fin-sample">${esc(t.sampleBadge)}</div>`
      : `<div class="badge-live">${esc(t.realBadge)} · ${esc(range)}</div>`;
    const k = acc.totals;
    kpis = `<div class="kpis fin-kpis">
      ${kpi(t.kRevenue, nok(k.revenue), t.kRevenueSub)}
      ${kpi(t.kCosts, nok(k.costs), t.kCostsSub)}
      ${kpi(t.kResult, nok(k.result), t.kResultSub, signClass(k.result))}
      ${kpi(t.kMargin, pct(k.marginPct, 2), t.kMarginSub, signClass(k.result))}
    </div>`;
    if (state.authRequired) actions = `<button class="fin-logout" type="button" data-act="logout">${esc(t.signOut)}</button>`;
  } else {
    badge = `<div class="badge-live">${esc(t.kicker)}</div>`;
  }
  return `<section class="hero fin-hero"><div class="wrap">
    <div class="fin-hero-top">${badge}${actions}</div>
    <h1>${t.title}</h1>
    <p>${esc(t.lead)}</p>
    ${state.data?.dataset === "sample" ? `<p class="fin-sample-note">${esc(t.sampleNote)}</p>` : ""}
    ${kpis}
  </div></section>`;
}

/* Value with a small unit (keeps "NOK" from wrapping onto its own line). */
const kpi = (l, v, s, cls = "") => {
  const m = String(v).match(/^(.*?)\s?(NOK|%)$/);
  const val = m ? `${esc(m[1])}<small class="fin-unit">${esc(m[2])}</small>` : esc(v);
  return `<div class="kpi"><div class="l">${esc(l)}</div><div class="v fin-kv ${cls}">${val}</div><div class="s">${esc(s)}</div></div>`;
};

function loginView() {
  const t = T();
  return `<div class="fin"><section class="section"><div class="wrap">
    <form class="card fin-login" novalidate>
      <div class="eyebrow">${esc(t.loginEb)}</div>
      <h2>${esc(t.loginTitle)}</h2>
      <p class="fin-muted">${esc(t.loginText)}</p>
      <label class="fin-field"><span>${esc(t.password)}</span>
        <input type="password" name="password" autocomplete="current-password" required></label>
      ${state.loginError ? `<p class="fin-error" role="alert">${esc(t[state.loginError])}</p>` : ""}
      <button class="btn" type="submit" ${state.busy ? "disabled" : ""}>${esc(state.busy ? t.signingIn : t.signIn)} <span aria-hidden="true">→</span></button>
    </form>
  </div></section></div>`;
}

function bindLogin() {
  const f = root.querySelector(".fin-login");
  const input = f.querySelector("input");
  if (!state.busy) input.focus();
  f.onsubmit = e => { e.preventDefault(); if (input.value) login(input.value); };
}

/* ---------------- Section A – actual accounting ---------------- */
function sectionA(acc) {
  const t = T();
  const d = state.data;
  const months = acc.months;
  return `<section class="section" aria-labelledby="fin-a-title"><div class="wrap">
    <div class="eyebrow">${esc(t.aEb)}</div>
    <h2 class="sec-title" id="fin-a-title">${esc(t.aTitle)}</h2>
    <p class="fin-lede">${esc(tpl(t.aNote, { sheet: d.source?.sheet || "–" }))}</p>
    <div class="fin-charts">
      <figure class="card fin-chart">
        <figcaption>${esc(t.chartRevCost)}</figcaption>
        <div class="fin-legend"><span><b class="sw sw-a"></b>${esc(t.sRevenue)}</span><span><b class="sw sw-b"></b>${esc(t.sCosts)}</span></div>
        ${chartGrouped(months, acc.revenue, acc.costs)}
      </figure>
      <figure class="card fin-chart">
        <figcaption>${esc(t.chartResult)}</figcaption>
        <div class="fin-legend"><span><b class="sw sw-pos"></b>${esc(t.positive)}</span><span><b class="sw sw-neg"></b>${esc(t.negative)}</span></div>
        ${chartPolarity(months, acc.result)}
      </figure>
    </div>
    <details class="fin-details">
      <summary><span class="when-closed">${esc(t.tableToggle)}</span><span class="when-open">${esc(t.tableHide)}</span></summary>
      ${accountingTable(acc)}
    </details>
  </div></section>`;
}

function accountingTable(acc) {
  const t = T();
  const a = state.data.accounting;
  const real = state.data.dataset === "real"; // cell references only exist for the extracted workbook
  const head = `<tr><th scope="col">${esc(t.category)}</th>${acc.months.map(m => `<th scope="col" class="num">${esc(monthShort(m.key))}</th>`).join("")}<th scope="col" class="num">${esc(t.total)}</th>${real ? `<th scope="col" class="cells">${esc(t.cells)}</th>` : ""}</tr>`;
  const label = l => (lang === "en" && l.account && ACCOUNT_EN[l.account]) ? ACCOUNT_EN[l.account] : l.label;
  const row = (name, vals, cls = "", cells = "") => `<tr class="${cls}"><th scope="row">${name}</th>${vals.map(v => `<td class="num">${esc(fmt(v))}</td>`).join("")}<td class="num">${esc(fmt(vals.reduce((x, y) => x + y, 0)))}</td>${real ? `<td class="cells">${esc(cells)}</td>` : ""}</tr>`;
  let body = row(esc(t.sRevenue), acc.revenue, "fin-row-strong", a.revenue.cells || "");
  for (const g of a.costGroups) {
    const sum = acc.groups.find(x => x.id === g.id);
    body += `<tr class="fin-row-group"><th scope="rowgroup" colspan="${acc.months.length + (real ? 3 : 2)}">${esc(t[g.id] || g.label)}</th></tr>`;
    for (const l of g.lines) body += row(`${l.account ? `<span class="acct">${esc(l.account)}</span> ` : ""}${esc(label(l))}`, l.values, "", l.cells || "");
    body += row(esc(t[g.id] || g.label), sum.monthly, "fin-row-sub", g.subtotalRow ? `F${g.subtotalRow}:K${g.subtotalRow}` : "");
  }
  body += row(esc(t.sCosts), acc.costs, "fin-row-strong", "F31:K31");
  body += `<tr class="fin-row-strong"><th scope="row">${esc(t.sResult)}</th>${acc.result.map(v => `<td class="num ${signClass(v)}">${esc(fmt(v))}</td>`).join("")}<td class="num ${signClass(acc.totals.result)}">${esc(fmt(acc.totals.result))}</td>${real ? `<td class="cells">F32:K32</td>` : ""}</tr>`;
  return `<div class="fin-table-wrap"><table class="fin-table"><thead>${head}</thead><tbody>${body}</tbody></table></div>`;
}

/* ---------------- Section B – modelled comparison ---------------- */
function sectionB(rm, acc) {
  const t = T();
  const d = state.data;
  const svc = it => t.services[it.id] || it.label;
  const avgInvoice = d.rateModel.averageInvoice;
  const accAvg = acc.totals.revenue / acc.months.length;
  const rows = rm.rows.map(r => `<tr>
      <th scope="row">${esc(svc(r))}<span class="src">${esc(r.label)}</span></th>
      <td>${esc(t.contractNames[r.contract] || r.contract || "–")}</td>
      <td class="num">${esc(fmt(r.normaRate))}</td><td class="num">${esc(fmt(r.referenceRate))}</td><td class="num">${esc(fmt(r.hours))}</td>
      <td class="num">${esc(fmt(r.normaAmount))}</td><td class="num">${esc(fmt(r.referenceAmount))}</td><td class="num">${esc(fmt(r.difference))}</td>
    </tr>`).join("");
  return `<section class="section gray" aria-labelledby="fin-b-title"><div class="wrap">
    <div class="eyebrow">${esc(t.bEb)}</div>
    <h2 class="sec-title" id="fin-b-title">${esc(t.bTitle)}</h2>
    <div class="fin-badges"><span class="fin-tag">${esc(t.bBadgeModel)}</span><span class="fin-tag">${esc(t.bBadgeAssump)}</span></div>
    <div class="fin-stats">
      ${stat(t.bNorma, nok(rm.norma))}${stat(t.bRef, nok(rm.reference))}
      ${stat(t.bDiff, nok(rm.difference))}${stat(t.bDiffPct, pct(rm.differencePctOfReference, 1))}
    </div>
    <div class="fin-b-grid">
      <figure class="card fin-chart">
        <figcaption>${esc(t.chartRates)}</figcaption>
        <div class="fin-legend"><span><b class="sw sw-a"></b>${esc(t.legNorma)}</span><span><b class="sw sw-b"></b>${esc(t.legRef)}</span></div>
        ${chartPairedH(rm.rows.map(r => ({ label: svc(r), a: r.normaAmount, b: r.referenceAmount })))}
      </figure>
      <div class="card fin-method">
        <h3>${esc(t.method)}</h3>
        <p>${esc(t.methodText)}</p>
        <h3>${esc(t.invoiceTitle)}</h3>
        <dl class="fin-dl">
          ${avgInvoice ? `<div><dt>${esc(tpl(t.invoiceAvg, { cell: avgInvoice.cell || "–" }))}</dt><dd>${esc(nok(avgInvoice.value))}</dd></div>` : ""}
          <div><dt>${esc(t.invoiceAcc)}</dt><dd>${esc(nok(accAvg))}</dd></div>
        </dl>
        <p class="fin-muted">${esc(t.invoiceNote)}</p>
      </div>
    </div>
    <div class="fin-table-wrap card"><table class="fin-table">
      <thead><tr><th scope="col">${esc(t.service)}</th><th scope="col">${esc(t.contract)}</th><th scope="col" class="num">${esc(t.normaRate)}</th><th scope="col" class="num">${esc(t.refRate)}</th><th scope="col" class="num">${esc(t.hours)}</th><th scope="col" class="num">${esc(t.normaAmt)}</th><th scope="col" class="num">${esc(t.refAmt)}</th><th scope="col" class="num">${esc(t.diff)}</th></tr></thead>
      <tbody>${rows}<tr class="fin-row-strong"><th scope="row">${esc(t.total)}</th><td></td><td></td><td></td><td></td><td class="num">${esc(fmt(rm.norma))}</td><td class="num">${esc(fmt(rm.reference))}</td><td class="num">${esc(fmt(rm.difference))}</td></tr></tbody>
    </table></div>
  </div></section>`;
}

const stat = (l, v) => `<div class="card fin-stat"><div class="l">${esc(l)}</div><div class="v">${esc(v)}</div></div>`;

/* ---------------- Section C – calculator ---------------- */
function sectionC() {
  const t = T();
  const c = state.calc;
  const presets = state.data.calculatorPresets || [];
  const preset = presets.find(p => p.id === state.presetId);
  const num = (name, value, label, attrs = "") => `<label class="fin-field"><span>${esc(label)}</span>
      <input type="number" inputmode="decimal" step="any" min="0" data-k="${name}" value="${esc(value)}" ${attrs}></label>`;
  const emps = c.employees.map((e, i) => `<div class="fin-emp">
      <label class="fin-field"><span>${esc(t.employee)} ${i + 1}</span><input type="text" data-emp-name="${i}" value="${esc(e.name)}" placeholder="${esc(t.employee)} ${i + 1}"></label>
      <label class="fin-field"><span>${esc(t.annualSalary)}</span><input type="number" inputmode="decimal" step="any" min="0" data-emp-salary="${i}" value="${esc(e.annualSalary)}"></label>
      <button type="button" class="fin-icon" data-emp-remove="${i}" ${c.employees.length < 2 ? "disabled" : ""} aria-label="${esc(t.remove)} ${i + 1}">×</button>
    </div>`).join("");
  const banner = preset ? `<div class="fin-preset-note"><p>${esc(preset.historical ? tpl(t.presetBanner, { sheet: preset.sheet }) : t.sampleBadge)}</p>
      ${(preset.notes || []).map(n => `<p class="fin-muted">${esc(n)}</p>`).join("")}
      <p class="fin-muted" data-wbcheck></p></div>` : "";
  return `<section class="section" aria-labelledby="fin-c-title"><div class="wrap">
    <div class="eyebrow">${esc(t.cEb)}</div>
    <h2 class="sec-title" id="fin-c-title">${esc(t.cTitle)}</h2>
    <p class="fin-lede">${esc(t.cNote)}</p>
    <div class="fin-calc">
      <form class="fin-inputs" autocomplete="off" onsubmit="return false">
        <div class="card fin-group">
          <label class="fin-field"><span>${esc(t.preset)}</span>
            <select data-preset>
              <option value="blank" ${state.presetId === "blank" ? "selected" : ""}>${esc(t.presetBlank)}</option>
              ${presets.length ? `<optgroup label="${esc(t.presetGroup)}">${presets.map(p => `<option value="${esc(p.id)}" ${p.id === state.presetId ? "selected" : ""}>${esc(p.label)}</option>`).join("")}</optgroup>` : ""}
            </select></label>
          ${banner}
        </div>
        <fieldset class="card fin-group"><legend>${esc(t.revenue)}</legend>
          <div class="fin-seg" role="radiogroup" aria-label="${esc(t.revenue)}">
            <label><input type="radio" name="mode" value="hourly" ${c.revenueMode === "hourly" ? "checked" : ""}> ${esc(t.modeHourly)}</label>
            <label><input type="radio" name="mode" value="fixed" ${c.revenueMode === "fixed" ? "checked" : ""}> ${esc(t.modeFixed)}</label>
          </div>
          <div class="fin-row2">
            ${num("hourlyRate", c.hourlyRate, t.hourlyRate, c.revenueMode === "fixed" ? "disabled" : "")}
            ${num("fixedFee", c.fixedFee, t.fixedFee, c.revenueMode === "hourly" ? "disabled" : "")}
          </div>
          ${num("billableHours", c.billableHours, t.billableHours)}
          <p class="fin-hint">${esc(t.hoursHint)}</p>
        </fieldset>
        <fieldset class="card fin-group"><legend>${esc(t.personnelIn)}</legend>
          <div class="fin-row3">
            ${num("rates.holidayPayPct", c.rates.holidayPayPct, t.hp)}
            ${num("rates.agaPct", c.rates.agaPct, t.aga)}
            ${num("rates.otpPct", c.rates.otpPct, t.otp)}
          </div>
          <label class="fin-check"><input type="checkbox" data-k="salaryIncludesHolidayPay" ${c.salaryIncludesHolidayPay ? "checked" : ""}> ${esc(t.inclHp)}</label>
          <div class="fin-emps">${emps}</div>
          <button type="button" class="fin-add" data-emp-add>${esc(t.addEmp)}</button>
        </fieldset>
        <fieldset class="card fin-group"><legend>${esc(t.opexIn)}</legend>
          <div class="fin-row2">${OPEX_KEYS.map(k => num(`opex.${k}`, c.opex[k] ?? 0, t.opex[k])).join("")}</div>
        </fieldset>
      </form>
      <div class="fin-outputs" aria-live="polite" data-outputs></div>
    </div>
  </div></section>`;
}

function setPath(obj, path, value) {
  const keys = path.split(".");
  let o = obj;
  while (keys.length > 1) o = o[keys.shift()];
  o[keys[0]] = value;
}

function bindCalculator() {
  const form = root.querySelector(".fin-inputs");
  form.addEventListener("input", e => {
    const el = e.target;
    const c = state.calc;
    if (el.dataset.k) {
      setPath(c, el.dataset.k, el.type === "checkbox" ? el.checked : toNumber(el.value));
    } else if (el.dataset.empSalary !== undefined) {
      c.employees[+el.dataset.empSalary].annualSalary = toNumber(el.value);
    } else if (el.dataset.empName !== undefined) {
      c.employees[+el.dataset.empName].name = el.value;
    } else if (el.name === "mode") {
      c.revenueMode = el.value;
      form.querySelector('[data-k="hourlyRate"]').disabled = el.value === "fixed";
      form.querySelector('[data-k="fixedFee"]').disabled = el.value === "hourly";
    }
    renderCalcOutputs();
  });
  form.addEventListener("change", e => {
    if (e.target.matches("[data-preset]")) {
      state.presetId = e.target.value;
      const p = (state.data.calculatorPresets || []).find(x => x.id === state.presetId);
      state.calc = p ? { ...blankInput(), ...clone(p.input), opex: { ...blankInput().opex, ...clone(p.input.opex) } } : blankInput();
      rerenderCalculator();
    }
  });
  form.addEventListener("click", e => {
    const b = e.target.closest("button");
    if (!b) return;
    if (b.matches("[data-emp-add]")) {
      state.calc.employees.push({ name: "", annualSalary: state.calc.employees.at(-1)?.annualSalary || 0 });
      rerenderCalculator(`[data-emp-salary="${state.calc.employees.length - 1}"]`);
    } else if (b.dataset.empRemove !== undefined && state.calc.employees.length > 1) {
      state.calc.employees.splice(+b.dataset.empRemove, 1);
      rerenderCalculator("[data-emp-add]");
    }
  });
}

function rerenderCalculator(focusSel) {
  const sec = root.querySelector("#fin-c-title").closest("section");
  const tmp = document.createElement("div");
  tmp.innerHTML = sectionC();
  sec.replaceWith(tmp.firstElementChild);
  bindCalculator();
  renderCalcOutputs();
  if (focusSel) root.querySelector(focusSel)?.focus();
}

function renderCalcOutputs() {
  const host = root?.querySelector("[data-outputs]");
  if (!host) return;
  const t = T();
  const c = state.calc;
  const r = calculateProject(c);
  const sc = compareRateReduction(c, state.reductionPct);
  const sens = rateSensitivity(c);
  const fixed = r.mode === "fixed";

  const tile = (l, v, s = "", cls = "") => `<div class="fin-out ${cls}"><div class="l">${esc(l)}</div><div class="v">${esc(v)}</div>${s ? `<div class="s">${esc(s)}</div>` : ""}</div>`;
  const comps = r.personnel.components;
  const social = comps.agaSalary + comps.agaHoliday + comps.otp + comps.agaOtp;
  const parts = [["base", comps.base], ["holidayPay", comps.holidayPay], ["social", social], ["opex", r.opex.total]];
  const maxPart = Math.max(...parts.map(p => p[1]), 1);
  const structure = parts.map(([k, v]) => `<div class="fin-barrow" tabindex="0" data-tip="${esc(`<b>${esc(t.struct[k])}</b><br>${esc(nok(v))}`)}">
      <span class="lbl">${esc(t.struct[k])}</span>
      <span class="fin-track"><i style="width:${(v / maxPart) * 100}%"></i></span>
      <span class="val">${esc(nok(v))} <small>${esc(pct(r.totalCost ? (v / r.totalCost) * 100 : null, 0))}</small></span></div>`).join("");

  const compRows = PERSONNEL_COMPONENTS.map(k => `<tr><th scope="row">${esc(t.comp[k])}</th>${r.personnel.employees.length > 1 ? r.personnel.employees.map(e => `<td class="num">${esc(fmt(e.cost[k], 2))}</td>`).join("") : ""}<td class="num">${esc(fmt(comps[k], 2))}</td></tr>`).join("");
  const empHead = r.personnel.employees.length > 1 ? r.personnel.employees.map((e, i) => `<th scope="col" class="num">${esc(c.employees[i].name || `${t.employee} ${i + 1}`)}</th>`).join("") : "";

  const scRow = (l, a, b, d) => `<tr><th scope="row">${esc(l)}</th><td class="num">${a}</td><td class="num">${b}</td><td class="num">${d}</td></tr>`;

  // Traceability to the workbook for the selected preset.
  const preset = (state.data.calculatorPresets || []).find(p => p.id === state.presetId);
  const wb = root.querySelector("[data-wbcheck]");
  if (wb && preset?.workbook?.total) {
    const ex = preset.workbook.opexExcludedByWorkbook?.value;
    wb.textContent = `${t.wbCheck}: ${t.wbTotal} ${nok(preset.workbook.total.value, 2)} (${preset.workbook.total.cell})` +
      (ex ? ` · ${tpl(t.wbExcluded, { v: nok(ex) })}` : "");
  }

  host.innerHTML = `
    <div class="card fin-group">
      <h3>${esc(t.out)}</h3>
      <div class="fin-out-grid fin-out-2">
        ${tile(t.oRevenue, nok(r.revenue))}
        ${tile(t.oPersonnel, nok(r.personnel.total))}
        ${tile(t.oOpex, nok(r.opex.total))}
        ${tile(t.oTotal, nok(r.totalCost))}
      </div>
      <div class="fin-result ${signClass(r.result)}">
        <div class="l">${esc(t.oResult)}</div>
        <div class="v">${esc(signedNok(r.result))}</div>
        <div class="s">${esc(t.oResultSub)}</div>
      </div>
      <div class="fin-out-grid">
        ${tile(t.oMargin, pct(r.marginPct), t.oMarginSub, signClass(r.result))}
        ${tile(t.oMarkup, pct(r.markupPct), t.oMarkupSub, signClass(r.result))}
        ${fixed ? tile(t.oBreakEvenFixed, nok(r.totalCost), t.oBreakEvenSub) : tile(t.oBreakEven, r.breakEvenRate === null ? t.none : `${fmt(r.breakEvenRate, 2)} ${t.perHour}`, t.oBreakEvenSub)}
      </div>
    </div>
    <div class="card fin-group">
      <h3>${esc(t.structure)}</h3>
      <div class="fin-bars">${structure}</div>
    </div>
    <div class="card fin-group">
      <h3>${esc(t.scen)}</h3>
      <label class="fin-field fin-inline"><span>${esc(t.reduction)}</span>
        <input type="number" min="0" max="100" step="1" data-reduction value="${esc(state.reductionPct)}"></label>
      <div class="fin-table-wrap"><table class="fin-table">
        <thead><tr><th></th><th scope="col" class="num">${esc(t.current)}</th><th scope="col" class="num">−${esc(fmt(sc.reductionPct, 0))} %</th><th scope="col" class="num">${esc(t.change)}</th></tr></thead>
        <tbody>
          ${scRow(fixed ? t.fixedFee : t.hourlyRate, esc(nok(fixed ? sc.current.fixedFee : sc.current.hourlyRate)), esc(nok(fixed ? sc.reduced.fixedFee : sc.reduced.hourlyRate)), esc(signedNok((fixed ? sc.reduced.fixedFee - sc.current.fixedFee : sc.reduced.hourlyRate - sc.current.hourlyRate))))}
          ${scRow(t.oRevenue, esc(nok(sc.current.revenue)), esc(nok(sc.reduced.revenue)), `<span class="${signClass(sc.deltaRevenue)}">${esc(signedNok(sc.deltaRevenue))}</span>`)}
          ${scRow(t.oResult, `<span class="${signClass(sc.current.result)}">${esc(nok(sc.current.result))}</span>`, `<span class="${signClass(sc.reduced.result)}">${esc(nok(sc.reduced.result))}</span>`, `<span class="${signClass(sc.deltaResult)}">${esc(signedNok(sc.deltaResult))}</span>`)}
          ${scRow(t.oMargin, esc(pct(sc.current.marginPct)), esc(pct(sc.reduced.marginPct)), `<span class="${signClass(sc.deltaMarginPp ?? 0)}">${esc(signedPp(sc.deltaMarginPp))}</span>`)}
        </tbody></table></div>
      <p class="fin-hint">${esc(t.scenNote)}</p>
    </div>
    <div class="card fin-group">
      <h3>${esc(t.sens)}</h3>
      <div class="fin-table-wrap"><table class="fin-table">
        <thead><tr><th scope="col">${esc(t.price)}</th><th scope="col" class="num">${esc(t.oRevenue)}</th><th scope="col" class="num">${esc(t.oResult)}</th><th scope="col" class="num">${esc(t.margin)}</th></tr></thead>
        <tbody>${sens.map(s => `<tr class="${s.factor === 1 ? "fin-row-strong" : ""}"><th scope="row">${esc(nok(s.price))} <span class="src">${s.factor === 1 ? "" : `${s.factor > 1 ? "+" : "−"}${fmt(Math.abs(s.factor - 1) * 100, 0)} %`}</span></th><td class="num">${esc(nok(s.revenue))}</td><td class="num ${signClass(s.result)}">${esc(nok(s.result))}</td><td class="num">${esc(pct(s.marginPct))}</td></tr>`).join("")}</tbody>
      </table></div>
    </div>
    <details class="card fin-group fin-details">
      <summary>${esc(t.personnelTable)}</summary>
      <div class="fin-table-wrap"><table class="fin-table">
        <thead><tr><th></th>${empHead}<th scope="col" class="num">${esc(t.total)}</th></tr></thead>
        <tbody>${compRows}<tr class="fin-row-strong"><th scope="row">${esc(t.oPersonnel)}</th>${r.personnel.employees.length > 1 ? r.personnel.employees.map(e => `<td class="num">${esc(fmt(e.cost.total, 2))}</td>`).join("") : ""}<td class="num">${esc(fmt(r.personnel.total, 2))}</td></tr></tbody>
      </table></div>
    </details>`;

  const red = host.querySelector("[data-reduction]");
  red.addEventListener("change", () => {
    state.reductionPct = Math.min(100, Math.max(0, toNumber(red.value)));
    renderCalcOutputs();
    root.querySelector("[data-reduction]")?.focus();
  });
}

function bindDashboard() {
  root.querySelector('[data-act="logout"]')?.addEventListener("click", logout);
}

/* ------------------------------------------------------------------ */
/* Charts (inline SVG, no library)                                     */
/* ------------------------------------------------------------------ */
const W = 560, H = 260, PAD = { l: 52, r: 12, t: 12, b: 28 };

function niceMax(v) {
  if (v <= 0) return 1;
  const p = 10 ** Math.floor(Math.log10(v));
  const n = v / p;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10) * p;
}

/** Bar path with 4px rounded data end (top for positive, bottom for negative). */
function barPath(x, y0, w, y1, r = 4) {
  const up = y1 < y0;
  const h = Math.abs(y1 - y0);
  const rr = Math.min(r, w / 2, h);
  if (h < 0.5) return "";
  return up
    ? `M${x},${y0}V${y1 + rr}Q${x},${y1} ${x + rr},${y1}H${x + w - rr}Q${x + w},${y1} ${x + w},${y1 + rr}V${y0}Z`
    : `M${x},${y0}V${y1 - rr}Q${x},${y1} ${x + rr},${y1}H${x + w - rr}Q${x + w},${y1} ${x + w},${y1 - rr}V${y0}Z`;
}

function gridLines(min, max, y, ticks = 4) {
  let s = "";
  for (let i = 0; i <= ticks; i++) {
    const v = min + ((max - min) * i) / ticks;
    const yy = y(v);
    s += `<line class="grid${v === 0 ? " zero" : ""}" x1="${PAD.l}" x2="${W - PAD.r}" y1="${yy}" y2="${yy}"/>`;
    s += `<text class="tick" x="${PAD.l - 8}" y="${yy + 4}" text-anchor="end">${esc(compact(v))}</text>`;
  }
  return s;
}

function chartGrouped(months, a, b) {
  const t = T();
  const max = niceMax(Math.max(...a, ...b));
  const ih = H - PAD.t - PAD.b, iw = W - PAD.l - PAD.r;
  const y = v => PAD.t + ih - (v / max) * ih;
  const step = iw / months.length, bw = Math.min(22, step * 0.3);
  let bars = "", hits = "", labels = "";
  months.forEach((m, i) => {
    const cx = PAD.l + step * i + step / 2;
    bars += `<path class="m-a" d="${barPath(cx - bw - 1, y(0), bw, y(a[i]))}"/>`;
    bars += `<path class="m-b" d="${barPath(cx + 1, y(0), bw, y(b[i]))}"/>`;
    labels += `<text class="tick" x="${cx}" y="${H - 8}" text-anchor="middle">${esc(monthShort(m.key))}</text>`;
    const tip = `<b>${esc(monthName(m.key))}</b><br>${esc(t.sRevenue)}: ${esc(nok(a[i]))}<br>${esc(t.sCosts)}: ${esc(nok(b[i]))}<br>${esc(t.sResult)}: ${esc(signedNok(a[i] - b[i]))}`;
    hits += `<rect class="hit" x="${PAD.l + step * i}" y="${PAD.t}" width="${step}" height="${ih}" tabindex="0" role="img" aria-label="${esc(`${monthName(m.key)}: ${t.sRevenue} ${nok(a[i])}, ${t.sCosts} ${nok(b[i])}`)}" data-tip="${esc(tip)}"/>`;
  });
  return `<svg class="fin-svg" viewBox="0 0 ${W} ${H}" role="group" aria-label="${esc(t.chartRevCost)}">${gridLines(0, max, y)}${bars}${labels}${hits}</svg>`;
}

function chartPolarity(months, vals) {
  const t = T();
  const absMax = niceMax(Math.max(...vals.map(Math.abs), 1));
  const ih = H - PAD.t - PAD.b, iw = W - PAD.l - PAD.r;
  const y = v => PAD.t + ih / 2 - (v / absMax) * (ih / 2);
  const step = iw / months.length, bw = Math.min(28, step * 0.42);
  let bars = "", hits = "", labels = "";
  months.forEach((m, i) => {
    const cx = PAD.l + step * i + step / 2;
    const v = vals[i];
    bars += `<path class="${v >= 0 ? "m-pos" : "m-neg"}" d="${barPath(cx - bw / 2, y(0), bw, y(v))}"/>`;
    const ly = v >= 0 ? y(v) - 6 : y(v) + 14;
    labels += `<text class="val" x="${cx}" y="${ly}" text-anchor="middle">${esc((v > 0 ? "+" : "") + compact(v))}</text>`;
    labels += `<text class="tick" x="${cx}" y="${H - 8}" text-anchor="middle">${esc(monthShort(m.key))}</text>`;
    hits += `<rect class="hit" x="${PAD.l + step * i}" y="${PAD.t}" width="${step}" height="${ih}" tabindex="0" role="img" aria-label="${esc(`${monthName(m.key)}: ${t.sResult} ${signedNok(v)}`)}" data-tip="${esc(`<b>${esc(monthName(m.key))}</b><br>${esc(t.sResult)}: ${esc(signedNok(v))}`)}"/>`;
  });
  return `<svg class="fin-svg" viewBox="0 0 ${W} ${H}" role="group" aria-label="${esc(t.chartResult)}">${gridLines(-absMax, absMax, y)}${bars}${labels}${hits}</svg>`;
}

function chartPairedH(rows) {
  const t = T();
  const rowH = 40, top = 8, left = 170, right = 16, w = W;
  const h = top + rows.length * rowH + 22;
  const max = niceMax(Math.max(...rows.flatMap(r => [r.a, r.b]), 1));
  const x = v => left + (v / max) * (w - left - right);
  const bh = 12;
  let s = "";
  for (let i = 0; i <= 4; i++) {
    const v = (max * i) / 4;
    s += `<line class="grid${i === 0 ? " zero" : ""}" x1="${x(v)}" x2="${x(v)}" y1="${top}" y2="${h - 22}"/><text class="tick" x="${x(v)}" y="${h - 6}" text-anchor="middle">${esc(compact(v))}</text>`;
  }
  rows.forEach((r, i) => {
    const y0 = top + i * rowH + 6;
    const path = (cls, v, yy) => {
      const x1 = x(v), rr = Math.min(4, (x1 - left) / 2, bh / 2);
      return v <= 0 ? "" : `<path class="${cls}" d="M${left},${yy}H${x1 - rr}Q${x1},${yy} ${x1},${yy + rr}V${yy + bh - rr}Q${x1},${yy + bh} ${x1 - rr},${yy + bh}H${left}Z"/>`;
    };
    s += `<text class="cat" x="${left - 10}" y="${y0 + bh + 3}" text-anchor="end">${esc(r.label)}</text>`;
    s += path("m-a", r.a, y0) + path("m-b", r.b, y0 + bh + 2);
    const tip = `<b>${esc(r.label)}</b><br>${esc(t.legNorma)}: ${esc(nok(r.a))}<br>${esc(t.legRef)}: ${esc(nok(r.b))}<br>${esc(t.diff)}: ${esc(nok(r.b - r.a))}`;
    s += `<rect class="hit" x="0" y="${top + i * rowH}" width="${w}" height="${rowH}" tabindex="0" role="img" aria-label="${esc(`${r.label}: ${t.legNorma} ${nok(r.a)}, ${t.legRef} ${nok(r.b)}`)}" data-tip="${esc(tip)}"/>`;
  });
  return `<svg class="fin-svg" viewBox="0 0 ${w} ${h}" role="group" aria-label="${esc(t.chartRates)}">${s}</svg>`;
}

/* Shared hover / focus tooltip */
function setupTooltip() {
  const tip = document.createElement("div");
  tip.className = "fin-tip";
  tip.setAttribute("role", "tooltip");
  tip.hidden = true;
  document.body.append(tip);
  const showTip = (el, x, y) => {
    tip.innerHTML = el.dataset.tip;
    tip.hidden = false;
    const r = tip.getBoundingClientRect();
    const px = Math.min(window.innerWidth - r.width - 8, Math.max(8, x + 14));
    const py = y - r.height - 12 < 8 ? y + 16 : y - r.height - 12;
    tip.style.left = `${px}px`; tip.style.top = `${py}px`;
  };
  const target = e => e.target.closest?.("[data-tip]");
  document.addEventListener("pointermove", e => { const el = target(e); if (el && root?.contains(el)) showTip(el, e.clientX, e.clientY); else tip.hidden = true; });
  document.addEventListener("focusin", e => {
    const el = target(e);
    if (el && root?.contains(el)) { const b = el.getBoundingClientRect(); showTip(el, b.left + b.width / 2, b.top); }
  });
  document.addEventListener("focusout", () => { tip.hidden = true; });
  document.addEventListener("scroll", () => { tip.hidden = true; }, { passive: true });
}
