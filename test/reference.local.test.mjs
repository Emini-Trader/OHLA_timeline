// Validation against the REAL workbooks. Runs only when the confidential dataset
// produced by scripts/extract_financials.py is available locally:
//   NORMA_FIN_DATA_FILE=/secure/path/financials.json npm test
// Expected values are the workbook's own cached formula results stored in the
// dataset (with cell references), so no confidential figures live in this repo.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { calculateProject, summarizeAccounting, summarizeRateModel } from "../public/js/finance/calc.mjs";
import { validateFinancialData } from "../public/js/finance/schema.mjs";
import { decodeDataset } from "../api/_lib/data.js";

const file = process.env.NORMA_FIN_DATA_FILE;
const data = file ? decodeDataset(readFileSync(file, "utf8")) : null;
const skip = data ? false : "set NORMA_FIN_DATA_FILE to run the real-workbook validation";
const close = (a, b, what, eps = 0.005) => assert.ok(Math.abs(a - b) < eps, `${what}: ${a} ≠ ${b}`);

test("real dataset passes schema and traceability checks", { skip }, () => {
  const v = validateFinancialData(data);
  assert.deepEqual(v.errors, []);
  assert.equal(data.dataset, "real");
});

test("accounting totals equal the workbook's L-column formulas", { skip }, () => {
  const s = summarizeAccounting(data.accounting);
  const wt = data.accounting.workbookTotals;
  close(s.totals.revenue, wt.revenue.value, "revenue L4");
  close(s.totals.costs, wt.costs.value, "costs L31");
  close(s.totals.result, wt.result.value, "result L32");
  close(s.totals.marginPct, wt.result.value / wt.revenue.value * 100, "margin");
});

test("rate model equals the workbook's C33 / D33", { skip }, () => {
  const s = summarizeRateModel(data.rateModel);
  close(s.norma, data.rateModel.workbookTotals.norma.value, "C33");
  close(s.reference, data.rateModel.workbookTotals.reference.value, "D33");
  close(s.differencePctOfReference, (s.reference - s.norma) / s.reference * 100, "difference %");
});

test("calculator reproduces every historical worksheet (workwear correction accounted for)", { skip }, () => {
  for (const p of data.calculatorPresets) {
    const r = calculateProject(p.input);
    const wb = p.workbook;
    if (wb.personnel) close(r.personnel.total, wb.personnel.value, `${p.id} personnel ${wb.personnel.cell}`);
    if (wb.opex) close(r.opex.total, wb.opex.value + (wb.opexExcludedByWorkbook?.value || 0), `${p.id} opex ${wb.opex.cell}`);
    if (wb.total) close(r.totalCost, wb.total.value + (wb.opexExcludedByWorkbook?.value || 0), `${p.id} total ${wb.total.cell}`);
    if (wb.revenue) close(r.revenue, wb.revenue.value, `${p.id} revenue ${wb.revenue.cell}`);
  }
});

test("OHLA mengdeberegner reference scenario", { skip }, () => {
  const p = data.calculatorPresets.find(x => x.id === "ohla-mengdeberegner");
  assert.ok(p, "preset present");
  const r = calculateProject(p.input);
  assert.equal(p.workbook.opexExcludedByWorkbook, undefined, "this sheet sums all cost lines");
  close(r.totalCost, p.workbook.total.value, "total cost D31");
  close(r.revenue, p.workbook.revenue.value, "revenue D42");
  close(r.result, p.workbook.revenue.value - p.workbook.total.value, "result D42−D31");
  close(r.marginPct, (p.workbook.revenue.value - p.workbook.total.value) / p.workbook.revenue.value * 100, "margin (workbook D51 formula)");
});

test("no confidential figure appears in the publicly served folder", { skip }, () => {
  const publicDir = new URL("../public", import.meta.url).pathname;
  const walk = d => readdirSync(d).flatMap(n => { const p = join(d, n); return statSync(p).isDirectory() ? walk(p) : [p]; });
  const text = walk(publicDir).filter(f => !f.endsWith(".png")).map(f => readFileSync(f, "utf8")).join("\n");
  const values = new Set();
  for (const g of data.accounting.costGroups) for (const l of g.lines) for (const v of l.values) if (v > 9999) values.add(v);
  for (const v of data.accounting.revenue.values) values.add(v);
  for (const k of ["revenue", "costs", "result", "personnel", "other"]) values.add(Math.abs(data.accounting.workbookTotals[k].value));
  for (const p of data.calculatorPresets) for (const e of p.input.employees) values.add(e.annualSalary);
  const leaks = [...values].filter(v => {
    const s = String(v), spaced = s.replace(/\B(?=(\d{3})+(?!\d))/g, " "), comma = s.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return text.includes(s) || text.includes(spaced) || text.includes(comma);
  });
  assert.deepEqual(leaks, []);
});
