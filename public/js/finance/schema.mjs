/**
 * Structural validation of the financial dataset (no data in this file).
 * The dataset is produced by scripts/extract_financials.py and delivered to
 * the browser only through the authenticated /api/financials endpoint.
 */
import { summarizeAccounting, summarizeRateModel, OPEX_KEYS } from "./calc.mjs";

const isNum = v => typeof v === "number" && Number.isFinite(v);
const isStr = v => typeof v === "string" && v.length > 0;

export function validateFinancialData(d) {
  const errors = [];
  const req = (cond, msg) => { if (!cond) errors.push(msg); };

  req(d && typeof d === "object", "dataset must be an object");
  if (!d || typeof d !== "object") return { ok: false, errors };

  req(d.schemaVersion === 1, "schemaVersion must be 1");
  req(d.dataset === "real" || d.dataset === "sample", "dataset must be 'real' or 'sample'");
  req(d.source && isStr(d.source.workbook), "source.workbook missing");

  // Accounting (actual data)
  const a = d.accounting;
  req(a && Array.isArray(a.months) && a.months.length > 0, "accounting.months missing");
  if (a && Array.isArray(a.months)) {
    const n = a.months.length;
    a.months.forEach((m, i) => req(isStr(m.key) && isStr(m.label), `accounting.months[${i}] invalid`));
    req(a.revenue && Array.isArray(a.revenue.values) && a.revenue.values.length === n && a.revenue.values.every(isNum),
      "accounting.revenue.values must have one number per month");
    req(Array.isArray(a.costGroups) && a.costGroups.length > 0, "accounting.costGroups missing");
    (a.costGroups || []).forEach((g, gi) => {
      req(isStr(g.id) && isStr(g.label) && Array.isArray(g.lines), `costGroups[${gi}] invalid`);
      (g.lines || []).forEach((l, li) => req(isStr(l.label) && Array.isArray(l.values) && l.values.length === n
        && l.values.every(isNum), `costGroups[${gi}].lines[${li}] must have one number per month`));
    });
    // Traceability: computed totals must equal the workbook's own formula results.
    if (!errors.length && a.workbookTotals) {
      const s = summarizeAccounting(a);
      const wt = a.workbookTotals;
      const chk = (key, val) => wt[key] && req(Math.abs(wt[key].value - val) < 0.5,
        `accounting total '${key}' ${val} ≠ workbook ${wt[key].cell} ${wt[key].value}`);
      chk("revenue", s.totals.revenue);
      chk("costs", s.totals.costs);
      chk("result", s.totals.result);
      for (const g of s.groups) chk(g.id, s.totals.groups[g.id]);
    }
  }

  // Rate model (modelled comparison)
  const r = d.rateModel;
  req(r && Array.isArray(r.items) && r.items.length > 0, "rateModel.items missing");
  (r?.items || []).forEach((it, i) => req(isStr(it.id) && isStr(it.label) && isNum(it.normaRate)
    && isNum(it.referenceRate) && isNum(it.hours), `rateModel.items[${i}] invalid`));
  if (r?.items?.length && r.workbookTotals && !errors.some(e => e.startsWith("rateModel"))) {
    const s = summarizeRateModel(r);
    const wt = r.workbookTotals;
    if (wt.norma) req(Math.abs(wt.norma.value - s.norma) < 0.5, `rate model NORMA ${s.norma} ≠ workbook ${wt.norma.value}`);
    if (wt.reference) req(Math.abs(wt.reference.value - s.reference) < 0.5, `rate model reference ${s.reference} ≠ workbook ${wt.reference.value}`);
  }
  if (r?.averageInvoice) req(isNum(r.averageInvoice.value), "rateModel.averageInvoice.value must be a number");

  // Calculator presets (historical, editable assumptions)
  req(Array.isArray(d.calculatorPresets), "calculatorPresets must be an array");
  (d.calculatorPresets || []).forEach((p, i) => {
    const inp = p?.input;
    req(isStr(p?.id) && isStr(p?.label) && inp, `calculatorPresets[${i}] invalid`);
    if (!inp) return;
    req(Array.isArray(inp.employees) && inp.employees.every(e => isNum(e.annualSalary)), `calculatorPresets[${i}].employees invalid`);
    req(inp.opex && Object.keys(inp.opex).every(k => OPEX_KEYS.includes(k) && isNum(inp.opex[k])), `calculatorPresets[${i}].opex invalid`);
  });

  return { ok: errors.length === 0, errors };
}
