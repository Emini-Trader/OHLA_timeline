// Formula tests with SYNTHETIC values (expected results computed by hand).
// Real-workbook validation lives in reference.local.test.mjs and runs only
// when the confidential dataset is available locally.
import test from "node:test";
import assert from "node:assert/strict";
import {
  calculateProject, employeeMonthlyCost, compareRateReduction, rateSensitivity,
  summarizeAccounting, summarizeRateModel, safeDiv, toNumber, STATUTORY_DEFAULTS,
} from "../public/js/finance/calc.mjs";

const close = (a, b, eps = 1e-6) => assert.ok(Math.abs(a - b) < eps, `${a} ≉ ${b}`);

const base = () => ({
  revenueMode: "hourly", hourlyRate: 950, billableHours: 155, fixedFee: 0,
  rates: { holidayPayPct: 10.2, agaPct: 14.1, otpPct: 2 },
  employees: [{ name: "A", annualSalary: 540000 }],
  opex: { accounting: 1200, insurance: 700, phone: 900, workwear: 800, travel: 2400 },
});

test("reference scenario reproduces the workbook methodology", () => {
  const r = calculateProject(base());
  const c = r.personnel.components;
  close(c.base, 45000);        // 540 000 / 12
  close(c.holidayPay, 4590);   // × 10.2 %
  close(c.agaSalary, 6345);    // × 14.1 %
  close(c.agaHoliday, 647.19); // 4 590 × 14.1 %
  close(c.otp, 900);           // × 2 %
  close(c.agaOtp, 126.9);      // 900 × 14.1 %
  close(r.personnel.total, 57609.09);
  close(r.opex.total, 6000);   // workwear included
  close(r.totalCost, 63609.09);
  close(r.revenue, 147250);    // 950 × 155
  close(r.result, 83640.91);
  close(r.marginPct, 83640.91 / 147250 * 100);
  close(r.markupPct, 83640.91 / 63609.09 * 100);
  close(r.breakEvenRate, 63609.09 / 155);
  close(r.personnelToSalaryRatio, 1.280202);
});

test("negative profitability", () => {
  const r = calculateProject({ ...base(), hourlyRate: 400 });
  close(r.revenue, 62000);
  close(r.result, 62000 - 63609.09);
  assert.ok(r.result < 0);
  assert.ok(r.marginPct < 0);
  close(r.breakEvenRate, 63609.09 / 155); // break-even does not depend on the rate
});

test("zero billable hours never divides by zero", () => {
  const r = calculateProject({ ...base(), billableHours: 0 });
  assert.equal(r.revenue, 0);
  assert.equal(r.marginPct, null);
  assert.equal(r.breakEvenRate, null);
  assert.equal(r.effectiveHourlyRate, null);
  close(r.result, -63609.09);
  const empty = calculateProject({});
  assert.equal(empty.totalCost, 0);
  assert.equal(empty.markupPct, null);
  assert.equal(safeDiv(1, 0), null);
});

test("fixed-fee revenue ignores the hourly rate", () => {
  const r = calculateProject({ ...base(), revenueMode: "fixed", fixedFee: 120000, hourlyRate: 99999 });
  assert.equal(r.mode, "fixed");
  close(r.revenue, 120000);
  close(r.result, 120000 - 63609.09);
  close(r.effectiveHourlyRate, 120000 / 155);
  const zeroHours = calculateProject({ ...base(), revenueMode: "fixed", fixedFee: 120000, billableHours: 0 });
  close(zeroHours.revenue, 120000);
  assert.equal(zeroHours.breakEvenRate, null);
});

test("rotating employees: costs per employee, hours stay the project total", () => {
  const one = calculateProject(base());
  const two = calculateProject({ ...base(), employees: [{ annualSalary: 540000 }, { annualSalary: 540000 }] });
  close(two.personnel.total, 2 * one.personnel.total);
  close(two.revenue, one.revenue);                    // hours not doubled
  close(two.billableHours, 155);
  close(two.breakEvenRate, (2 * 57609.09 + 6000) / 155);
  const mixed = calculateProject({ ...base(), employees: [{ annualSalary: 540000 }, { annualSalary: 720000 }] });
  close(mixed.personnel.employees[1].cost.total, 60000 * 1.280202); // 720 000 / 12
  close(mixed.personnel.total, 57609.09 + 60000 * 1.280202);
});

test("changes to assumptions and rates", () => {
  const r0 = calculateProject(base());
  const higherRate = calculateProject({ ...base(), hourlyRate: 1050 });
  close(higherRate.result - r0.result, 100 * 155);
  const higherAga = calculateProject({ ...base(), rates: { ...base().rates, agaPct: 0 } });
  close(r0.totalCost - higherAga.totalCost, 6345 + 647.19 + 126.9);
  const moreOpex = calculateProject({ ...base(), opex: { ...base().opex, other: 2500 } });
  close(moreOpex.totalCost - r0.totalCost, 2500);
  const strings = calculateProject({ ...base(), hourlyRate: "1 150", billableHours: "155,0" });
  close(strings.revenue, 178250);
  assert.equal(toNumber("abc"), 0);
  const negativeInput = calculateProject({ ...base(), hourlyRate: -5 });
  assert.equal(negativeInput.revenue, 0);
  assert.deepEqual(calculateProject({ employees: [{ annualSalary: 1 }] }).personnel.employees.length, 1);
  assert.equal(STATUTORY_DEFAULTS.agaPct, 14.1);
});

test("workwear is part of operating costs (workbook subtotal bug corrected)", () => {
  const withoutWorkwear = calculateProject({ ...base(), opex: { ...base().opex, workwear: 0 } });
  close(calculateProject(base()).opex.total - withoutWorkwear.opex.total, 800);
});

test("holiday pay already included in the annual salary is not double counted", () => {
  const e = employeeMonthlyCost({ annualSalary: 595080 }, STATUTORY_DEFAULTS, { salaryIncludesHolidayPay: true });
  close(e.base + e.holidayPay, 595080 / 12); // total pay unchanged (540 000 × 1.102)
  close(e.base, 45000);
  close(e.holidayPay, 4590);
});

test("20 % rate reduction keeps workload and costs identical", () => {
  const s = compareRateReduction(base(), 20);
  close(s.reduced.hourlyRate, 760);
  close(s.reduced.totalCost, s.current.totalCost);
  close(s.deltaRevenue, -29450);
  close(s.deltaResult, -29450);
  close(s.deltaMarginPp, ((117800 - 63609.09) / 117800 - 83640.91 / 147250) * 100);
  const fixed = compareRateReduction({ ...base(), revenueMode: "fixed", fixedFee: 100000 }, 20);
  close(fixed.reduced.revenue, 80000);
  const zero = compareRateReduction({ ...base(), hourlyRate: 0 }, 20);
  assert.equal(zero.deltaMarginPp, null);
});

test("rate sensitivity replaces the hard-coded matrix", () => {
  const rows = rateSensitivity(base(), [0.8, 1, 1.2]);
  rows.forEach((r, i) => close(r.price, [760, 950, 1140][i]));
  close(rows[2].result, 1140 * 155 - 63609.09);
});

test("dashboard summaries (synthetic accounting and rate model)", () => {
  const acc = summarizeAccounting({
    months: [{ key: "2026-05", label: "Mai" }, { key: "2026-06", label: "Juni" }],
    revenue: { values: [100, 200] },
    costGroups: [{ id: "personnel", label: "L", lines: [{ label: "a", values: [50, 60] }, { label: "b", values: [10, 0] }] },
      { id: "other", label: "O", lines: [{ label: "c", values: [70, 20] }] }],
  });
  assert.deepEqual(acc.costs, [130, 80]);
  assert.deepEqual(acc.result, [-30, 120]);
  assert.equal(acc.totals.result, 90);
  close(acc.totals.marginPct, 30);
  assert.equal(acc.totals.groups.personnel, 120);

  const rm = summarizeRateModel({ items: [
    { id: "x", label: "x", normaRate: 800, referenceRate: 1000, hours: 100 },
    { id: "y", label: "y", normaRate: 0, referenceRate: 1500, hours: 10 },
  ] });
  assert.equal(rm.norma, 80000);
  assert.equal(rm.reference, 115000);
  assert.equal(rm.difference, 35000);
  close(rm.differencePctOfReference, 35000 / 115000 * 100);
  assert.equal(summarizeRateModel({ items: [] }).differencePctOfReference, null);
});
