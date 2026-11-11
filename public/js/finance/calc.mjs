/**
 * NORMA – financial calculations.
 *
 * Pure functions only: no data, no DOM, no network. Used by the browser UI
 * (public/js/okonomi.mjs) and by the automated tests (test/*.test.mjs).
 *
 * Methodology follows the workbook "Kalkulacja zysku projektowego.xlsx"
 * (rows 6–14 personnel, 21–31 operating costs, 40–42 revenue, 49+ margin)
 * with the corrections documented in README.md:
 *  - every operating-cost line is included (the workbook omitted workwear
 *    in some subtotals),
 *  - rate scenarios are calculated, not typed into a matrix,
 *  - divisions by zero return null instead of #DIV/0!,
 *  - personnel cost is the sum over individual employees, while billable
 *    hours are a separate project total (rotation ≠ double hours),
 *  - an option prevents double counting when the annual salary already
 *    includes holiday pay.
 */

export const STATUTORY_DEFAULTS = Object.freeze({
  holidayPayPct: 10.2, // ferieloven, 5 weeks (workbook: 10,2 % eller 12 %)
  agaPct: 14.1,        // arbeidsgiveravgift, sone I
  otpPct: 2,           // obligatorisk tjenestepensjon, minimum
});

export const OPEX_KEYS = Object.freeze([
  "accounting", "insurance", "equipment", "vehicle", "phone",
  "workwear", "travel", "accommodation", "other",
]);

/** Parse user input ("12 500,5", "850", 850) to a finite number, else 0. */
export function toNumber(v) {
  if (typeof v === "number") return Number.isFinite(v) ? v : 0;
  if (typeof v !== "string") return 0;
  const n = Number(v.replace(/[\s ]/g, "").replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}

/** a / b, or null when the denominator is zero / not finite. */
export function safeDiv(a, b) {
  return b === 0 || !Number.isFinite(b) || !Number.isFinite(a) ? null : a / b;
}

const nonNeg = v => Math.max(0, toNumber(v));
const sum = arr => arr.reduce((a, b) => a + b, 0);

/* ------------------------------------------------------------------ */
/* Personnel                                                           */
/* ------------------------------------------------------------------ */

/**
 * Monthly employer cost for one employee.
 *  base        = annual salary / 12
 *  holidayPay  = base × holiday-pay rate          (feriepenger provision)
 *  agaSalary   = base × AGA
 *  agaHoliday  = holidayPay × AGA
 *  otp         = base × OTP
 *  agaOtp      = otp × AGA
 * If `salaryIncludesHolidayPay` is true the annual figure is treated as total
 * pay incl. holiday pay, so it is split instead of adding holiday pay on top.
 */
export function employeeMonthlyCost(employee, rates = STATUTORY_DEFAULTS, opts = {}) {
  const hp = nonNeg(rates.holidayPayPct) / 100;
  const aga = nonNeg(rates.agaPct) / 100;
  const otpRate = nonNeg(rates.otpPct) / 100;
  const monthlyPay = nonNeg(employee?.annualSalary) / 12;
  const base = opts.salaryIncludesHolidayPay ? monthlyPay / (1 + hp) : monthlyPay;
  const holidayPay = base * hp;
  const agaSalary = base * aga;
  const agaHoliday = holidayPay * aga;
  const otp = base * otpRate;
  const agaOtp = otp * aga;
  const total = base + holidayPay + agaSalary + agaHoliday + otp + agaOtp;
  return { base, holidayPay, agaSalary, agaHoliday, otp, agaOtp, total };
}

export const PERSONNEL_COMPONENTS = Object.freeze(
  ["base", "holidayPay", "agaSalary", "agaHoliday", "otp", "agaOtp"]);

/* ------------------------------------------------------------------ */
/* Project calculation                                                 */
/* ------------------------------------------------------------------ */

/**
 * @param {object} input
 *  revenueMode: "hourly" | "fixed"
 *  hourlyRate, billableHours (project total per month), fixedFee
 *  rates: {holidayPayPct, agaPct, otpPct}
 *  salaryIncludesHolidayPay: boolean
 *  employees: [{name, annualSalary}]
 *  opex: {accounting, insurance, ...} monthly NOK
 */
export function calculateProject(input = {}) {
  const rates = { ...STATUTORY_DEFAULTS, ...(input.rates || {}) };
  const opts = { salaryIncludesHolidayPay: !!input.salaryIncludesHolidayPay };
  const employees = (input.employees || []).map((e, i) => ({
    name: e?.name || `#${i + 1}`,
    annualSalary: nonNeg(e?.annualSalary),
    cost: employeeMonthlyCost(e, rates, opts),
  }));

  const components = Object.fromEntries(PERSONNEL_COMPONENTS.map(k =>
    [k, sum(employees.map(e => e.cost[k]))]));
  const personnelTotal = sum(employees.map(e => e.cost.total));

  const opexItems = Object.fromEntries(OPEX_KEYS.map(k => [k, nonNeg(input.opex?.[k])]));
  const opexTotal = sum(Object.values(opexItems)); // all lines, incl. workwear

  const totalCost = personnelTotal + opexTotal;
  const billableHours = nonNeg(input.billableHours);
  const hourlyRate = nonNeg(input.hourlyRate);
  const fixedFee = nonNeg(input.fixedFee);
  const mode = input.revenueMode === "fixed" ? "fixed" : "hourly";
  const revenue = mode === "fixed" ? fixedFee : hourlyRate * billableHours;
  const result = revenue - totalCost;

  return {
    mode,
    revenue,
    billableHours,
    hourlyRate,
    fixedFee,
    personnel: { employees, components, total: personnelTotal },
    opex: { items: opexItems, total: opexTotal },
    totalCost,
    result,                                         // estimated project result (NOK)
    marginPct: pct(safeDiv(result, revenue)),       // result / revenue
    markupPct: pct(safeDiv(result, totalCost)),     // result / cost (påslag)
    breakEvenRate: safeDiv(totalCost, billableHours),
    costPerHour: safeDiv(totalCost, billableHours),
    effectiveHourlyRate: safeDiv(revenue, billableHours),
    personnelToSalaryRatio: safeDiv(personnelTotal, components.base), // workbook row 16
  };
}

const pct = v => (v === null ? null : v * 100);

/**
 * Compare the current price with a reduced price (default −20 %), keeping
 * workload and costs identical. Hourly mode reduces the rate, fixed mode the fee.
 */
export function compareRateReduction(input, reductionPct = 20) {
  const f = 1 - nonNeg(reductionPct) / 100;
  const current = calculateProject(input);
  const reduced = calculateProject({
    ...input,
    hourlyRate: nonNeg(input.hourlyRate) * f,
    fixedFee: nonNeg(input.fixedFee) * f,
  });
  return {
    reductionPct: nonNeg(reductionPct),
    current,
    reduced,
    deltaRevenue: reduced.revenue - current.revenue,
    deltaResult: reduced.result - current.result,
    deltaMarginPp: current.marginPct === null || reduced.marginPct === null
      ? null : reduced.marginPct - current.marginPct,
  };
}

/** Dynamic replacement for the workbook's hard-coded rate/margin matrix. */
export function rateSensitivity(input, factors = [0.8, 0.9, 1, 1.1, 1.2]) {
  return factors.map(factor => {
    const r = calculateProject({
      ...input,
      hourlyRate: nonNeg(input.hourlyRate) * factor,
      fixedFee: nonNeg(input.fixedFee) * factor,
    });
    return {
      factor,
      price: r.mode === "fixed" ? r.fixedFee : r.hourlyRate,
      revenue: r.revenue,
      result: r.result,
      marginPct: r.marginPct,
    };
  });
}

/* ------------------------------------------------------------------ */
/* Dashboard (FINANCIAL ANALYSIS)                                      */
/* ------------------------------------------------------------------ */

const lineSum = (lines, i) => sum(lines.map(l => toNumber(l.values[i])));

/** Monthly and total figures from the accounting block (actual data). */
export function summarizeAccounting(acc) {
  const n = acc.months.length;
  const idx = [...Array(n).keys()];
  const revenue = idx.map(i => toNumber(acc.revenue.values[i]));
  const groups = acc.costGroups.map(g => ({
    id: g.id, label: g.label,
    monthly: idx.map(i => lineSum(g.lines, i)),
  }));
  const costs = idx.map(i => sum(groups.map(g => g.monthly[i])));
  const result = idx.map(i => revenue[i] - costs[i]);
  const totals = {
    revenue: sum(revenue),
    costs: sum(costs),
    result: sum(result),
    groups: Object.fromEntries(groups.map(g => [g.id, sum(g.monthly)])),
  };
  totals.marginPct = pct(safeDiv(totals.result, totals.revenue));
  return { months: acc.months, revenue, groups, costs, result, totals };
}

/** Modelled monthly cost comparison: rate × hours per service. */
export function summarizeRateModel(model) {
  const rows = model.items.map(it => {
    const hours = nonNeg(it.hours);
    const normaAmount = nonNeg(it.normaRate) * hours;
    const referenceAmount = nonNeg(it.referenceRate) * hours;
    return { ...it, hours, normaAmount, referenceAmount, difference: referenceAmount - normaAmount };
  });
  const norma = sum(rows.map(r => r.normaAmount));
  const reference = sum(rows.map(r => r.referenceAmount));
  const difference = reference - norma;
  return {
    rows, norma, reference, difference,
    differencePctOfReference: pct(safeDiv(difference, reference)),
    differencePctOfNorma: pct(safeDiv(difference, norma)),
  };
}
