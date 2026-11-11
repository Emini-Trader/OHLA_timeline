/**
 * NON-CONFIDENTIAL SAMPLE DATA.
 * Synthetic, rounded figures with the same structure as the real dataset.
 * They are NOT NORMA Geosystems' accounts and are served only when no real
 * dataset (NORMA_FIN_DATA) is configured, always flagged as dataset: "sample".
 */
const months = ["05", "06", "07", "08", "09", "10"].map((m, i) => ({
  key: `2026-${m}`, column: "F", label: ["Mai", "Juni", "Juli", "Aug", "Sept", "Okt"][i],
}));

export const SAMPLE_DATA = Object.freeze({
  schemaVersion: 1,
  dataset: "sample",
  source: {
    workbook: "SAMPLE (synthetic)",
    sheet: "SAMPLE",
    year: 2026,
    note: "Synthetic sample figures for layout and testing only.",
  },
  accounting: {
    months,
    revenue: { label: "Salgsinntekter", values: [400000, 380000, 420000, 410000, 395000, 430000] },
    costGroups: [
      {
        id: "personnel", label: "Lønnskostnad",
        lines: [
          { account: "5000", label: "Lønn til ansatte", values: [200000, 200000, 210000, 180000, 190000, 215000] },
          { account: "5020", label: "Feriepenger", values: [20000, 20000, 21000, 18000, 19000, 21500] },
          { account: "5400", label: "Arbeidsgiveravgift", values: [31000, 31000, 32600, 27900, 29700, 33300] },
          { account: "5945", label: "Pensjonsforsikring for ansatte", values: [4000, 4000, 4200, 3600, 3800, 4300] },
        ],
      },
      {
        id: "other", label: "Annen driftskostnad",
        lines: [
          { account: "6300", label: "Leie lokale", values: [20000, 20000, 20000, 20000, 20000, 20000] },
          { account: "6440", label: "Leie transportmidler", values: [25000, 25000, 25000, 25000, 25000, 25000] },
          { account: "6705", label: "Honorar regnskap", values: [8000, 8000, 8000, 15000, 15000, 15000] },
          { account: "7140", label: "Reisekostnad, ikke oppgavepliktig", values: [5000, 4000, 5000, 9000, 2000, 5000] },
          { account: "7500", label: "Forsikringspremie", values: [3000, 3000, 3000, 3000, 3000, 6000] },
        ],
      },
    ],
  },
  rateModel: {
    items: [
      { id: "lead", label: "Lead survey", contract: "HOVED KONTRAKT", normaRate: 800, referenceRate: 1000, hours: 160 },
      { id: "office", label: "Office work", contract: "HOVED KONTRAKT", normaRate: 800, referenceRate: 900, hours: 160 },
      { id: "field", label: "Fieldwork", contract: "HOVED KONTRAKT", normaRate: 800, referenceRate: 900, hours: 160 },
      { id: "monitoring", label: "Geometric monitoring", contract: "UTEN KONTRAKT", normaRate: 900, referenceRate: 1000, hours: 60 },
    ],
    averageInvoice: { label: "Average invoice (sample)", value: 400000 },
  },
  calculatorPresets: [
    {
      id: "sample-one", label: "Sample – 1 employee", sheet: "SAMPLE",
      input: {
        revenueMode: "hourly", hourlyRate: 800, billableHours: 150, fixedFee: 0,
        rates: { holidayPayPct: 10.2, agaPct: 14.1, otpPct: 2 },
        employees: [{ name: "Ressurs 1", annualSalary: 575000 }],
        opex: { accounting: 1000, insurance: 500, equipment: 3000, phone: 500, workwear: 500 },
      },
    },
    {
      id: "sample-rotation", label: "Sample – 2 employees, 14/14 rotation", sheet: "SAMPLE",
      input: {
        revenueMode: "hourly", hourlyRate: 800, billableHours: 300, fixedFee: 0,
        rates: { holidayPayPct: 10.2, agaPct: 14.1, otpPct: 2 },
        employees: [{ name: "Rotasjon A", annualSalary: 575000 }, { name: "Rotasjon B", annualSalary: 610000 }],
        opex: { accounting: 2000, insurance: 1000, equipment: 4000, vehicle: 8000, phone: 1000, workwear: 1000, travel: 6000 },
      },
    },
  ],
});
