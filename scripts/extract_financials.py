#!/usr/bin/env python3
"""
Extract the NORMA financial dataset from the two source workbooks into the
validated JSON structure served by /api/financials.

The output contains CONFIDENTIAL data. Never commit it and never place it in
public/. Store it only as the Vercel environment variable NORMA_FIN_DATA:

    python3 scripts/extract_financials.py \
        --financial "FINANCIAL ANALYSIS.xlsx" \
        --calculation "Kalkulacja zysku projektowego.xlsx" \
        --year 2026 --out /secure/place/financials.json --base64 /secure/place/financials.b64

Requires: openpyxl (pip install openpyxl). Fails loudly when the workbook
layout differs from the one this script was written against, or when the
recomputed sums differ from the workbook's own cached formula results.
Every value carries its cell reference for traceability.
"""
import argparse, base64, datetime, json, re, sys

try:
    import openpyxl
except ImportError:
    sys.exit("openpyxl is required: pip install openpyxl")

MONTH_COLS = ["F", "G", "H", "I", "J", "K"]
MONTH_NUM = {"Mai": 5, "Juni": 6, "Juli": 7, "Aug": 8, "Sept": 9, "Okt": 10}
OPEX_LABELS = [  # Polish row labels in the calculation workbook → calculator keys
    (r"^ksi[eę]gowo", "accounting"), (r"^ubezpieczen", "insurance"), (r"^sprz[eę]t", "equipment"),
    (r"^samoch", "vehicle"), (r"^telefon", "phone"), (r"^ubranie", "workwear"),
    (r"^(loty|podr[oó][zż])", "travel"), (r"^dieta", "accommodation"),
]


class LayoutError(Exception):
    pass


def clean(v):
    return re.sub(r"\s+", " ", str(v).replace("\xa0", " ")).strip() if v is not None else ""


def num(v):
    if v is None:
        return 0
    if isinstance(v, bool) or not isinstance(v, (int, float)):
        raise LayoutError(f"expected a number, got {v!r}")
    return int(v) if float(v).is_integer() else float(v)


def expect(ws, cell, pattern):
    text = clean(ws[cell].value)
    if not re.search(pattern, text, re.I):
        raise LayoutError(f"{ws.title}!{cell}: expected /{pattern}/, found {text!r}")
    return text


def close(a, b, what):
    if abs(a - b) > 0.01:
        raise LayoutError(f"{what}: recomputed {a} ≠ workbook {b}")


# --------------------------------------------------------------------------- #
def extract_financial(path, year):
    wf = openpyxl.load_workbook(path, data_only=False)
    wv = openpyxl.load_workbook(path, data_only=True)
    ws, vs = wf["Ark1"], wv["Ark1"]

    months = []
    for col in MONTH_COLS:
        label = clean(ws[f"{col}1"].value)
        if label not in MONTH_NUM:
            raise LayoutError(f"Ark1!{col}1: unexpected month label {label!r}")
        months.append({"key": f"{year}-{MONTH_NUM[label]:02d}", "column": col, "label": label})

    expect(ws, "E4", r"^Salgsinntekter$")
    expect(ws, "E14", r"^Lønnskostnad$")
    expect(ws, "E30", r"^Annen driftskostnad$")
    expect(ws, "E31", r"^Driftskostnader$")
    expect(ws, "E32", r"^Driftsresultat$")

    def line(row):
        label = clean(ws[f"E{row}"].value)
        m = re.match(r"^(\d{4})\s+(.*)$", label)
        return {
            "account": m.group(1) if m else None,
            "label": m.group(2) if m else label,
            "row": row,
            "cells": f"F{row}:K{row}",
            "values": [num(vs[f"{c}{row}"].value) for c in MONTH_COLS],
        }

    revenue = line(4)
    revenue["label"] = "Salgsinntekter"
    groups = [
        {"id": "personnel", "label": "Lønnskostnad", "subtotalRow": 14, "lines": [line(r) for r in range(5, 14)]},
        {"id": "other", "label": "Annen driftskostnad", "subtotalRow": 30, "lines": [line(r) for r in range(15, 30)]},
    ]

    # Recompute and compare with the workbook's cached formula results.
    for g in groups:
        for i, c in enumerate(MONTH_COLS):
            close(sum(l["values"][i] for l in g["lines"]), num(vs[f"{c}{g['subtotalRow']}"].value), f"{g['id']} {c}")
    for i, c in enumerate(MONTH_COLS):
        cost = sum(sum(l["values"][i] for l in g["lines"]) for g in groups)
        close(revenue["values"][i] - cost, num(vs[f"{c}32"].value), f"result {c}")

    totals = {
        "revenue": {"cell": "L4", "value": num(vs["L4"].value)},
        "personnel": {"cell": "L14", "value": num(vs["L14"].value)},
        "other": {"cell": "L30", "value": num(vs["L30"].value)},
        "costs": {"cell": "L31", "value": num(vs["L31"].value)},
        "result": {"cell": "L32", "value": num(vs["L32"].value)},
    }

    # Rate model (indicative assumptions, columns C = NORMA contract, D = "MARKED").
    expect(ws, "C1", r"TIME PRIS")
    expect(ws, "C2", r"KONTRAKT")
    expect(ws, "D2", r"MARKED")
    spec = [  # id, row, label cell, contract cell, hours, hours source
        ("lead", 4, "B4", "A3", 165, "C29"),
        ("office", 13, "B13", "A13", 165, "C29"),
        ("field", 18, "B18", "A13", 165, "C29"),
        ("drone", 26, "B26", "A26", 165, "C29"),
        ("monitoring", 28, "B28", "A28", 80, "C31"),
        ("design", 12, "B32", "A12", 20, "D32"),
    ]
    items = []
    for id_, row, lab, con, hours, hsrc in spec:
        items.append({
            "id": id_, "label": clean(ws[lab].value), "contract": clean(ws[con].value),
            "normaRate": num(vs[f"C{row}"].value), "referenceRate": num(vs[f"D{row}"].value),
            "hours": hours,
            "cells": {"normaRate": f"C{row}", "referenceRate": f"D{row}", "label": lab, "contract": con, "hours": hsrc},
        })
    # Hours are constants inside formulas – verify them against the formula text and results.
    for cell, pat in [("C29", r"\*165"), ("C31", r"\*80"), ("D32", r"\*20")]:
        if not re.search(pat, str(ws[cell].value)):
            raise LayoutError(f"Ark1!{cell}: expected hours {pat} in formula {ws[cell].value!r}")
    close(sum(i["normaRate"] * i["hours"] for i in items), num(vs["C33"].value), "rate model NORMA (C33)")
    close(sum(i["referenceRate"] * i["hours"] for i in items), num(vs["D33"].value), "rate model reference (D33)")
    expect(ws, "B35", r"average.*invoice")

    return {
        "source": {
            "workbook": "FINANCIAL ANALYSIS.xlsx", "sheet": "Ark1", "title": clean(ws["A1"].value),
            "year": year, "yearNote": "Year not stated in the workbook; confirmed by the owner.",
        },
        "accounting": {"months": months, "revenue": revenue, "costGroups": groups, "workbookTotals": totals},
        "rateModel": {
            "items": items,
            "workbookTotals": {"norma": {"cell": "C33", "value": num(vs["C33"].value)},
                               "reference": {"cell": "D33", "value": num(vs["D33"].value)}},
            "averageInvoice": {"cell": "C35", "label": clean(ws["B35"].value), "value": num(vs["C35"].value),
                               "note": "Manually entered value in the workbook (not a formula)."},
        },
    }


# --------------------------------------------------------------------------- #
PRESETS = [
    # id, sheet, salary cells, rate column, opex value column, opex label column, workbook cells, notes
    dict(id="ohla-mengdeberegner", sheet="Projekt OHLA mengdeberegner", salaries=["D6"], rc="F", oc="D",
         wb=dict(personnel="D14", opex="D29", total="D31", revenue="D42"), notes=[]),
    dict(id="produksjonsstikker", sheet="produksjonsstikker", salaries=["D6"], rc="F", oc="D",
         wb=dict(personnel="D14", opex="D29", total="D31", revenue="D42"),
         notes=["Workbook also lists salary variants in M6, R6, W6 – edit the salary to test them."]),
    dict(id="stikningsleder", sheet="stikningsleder", salaries=["G6"], rc="I", oc="D",
         wb=dict(personnel="G14", opex="D29", total="G31", revenue="D42"),
         notes=["Workbook also lists salary variants in L6, Q6, V6 – edit the salary to test them."]),
    dict(id="sotra-1", sheet="Projekt Sotra rev2", salaries=["G6"], rc="I", oc="D",
         wb=dict(personnel="G14", opex="D29", total="G31", revenue="D42"),
         notes=["Night-shift variant (column H) not imported: its salary formula is not a standard rotation model."]),
    dict(id="sotra-2", sheet="Projekt Sotra rev2", salaries=["G6", "G6"], rc="I", oc="E", hours_factor=2,
         wb=dict(total="G32"),
         notes=["Workbook models two employees billing in parallel (hours × 2), not a 14/14 rotation."]),
    dict(id="mo-i-rana", sheet="Projekt Mo i Rana", salaries=["D6"], rc="F", oc="D",
         wb=dict(personnel="D14", opex="D29", total="D31", revenue="D42"), notes=[]),
    dict(id="lns-alta", sheet="Projekt LNS Alta", salaries=["D6"], rc="F", oc="D",
         wb=dict(personnel="D14", opex="D29", total="D31", revenue="D42"), notes=[]),
    dict(id="sotra-geofundamentering", sheet="Projekt Sotra GeoFundamentering", salaries=["D6"], rc="F", oc="D",
         wb=dict(personnel="D14", opex="D29", total="D31", revenue="D42"),
         notes=["Workbook rate matrix contains #DIV/0! for empty rates; replaced by calculated scenarios."]),
]


def extract_presets(path):
    wf = openpyxl.load_workbook(path, data_only=False)
    wv = openpyxl.load_workbook(path, data_only=True)
    out = []
    for p in PRESETS:
        ws, vs = wf[p["sheet"]], wv[p["sheet"]]
        rc = p["rc"]
        expect(ws, f"{chr(ord(rc) - 3) if rc == 'I' else 'C'}8", r"Feriepenger")
        expect(ws, "C40", r"Stawka godzinowa")
        expect(ws, "C41", r"godzin")
        opex, opex_cells = {}, {}
        for row in range(21, 29):
            label = clean(ws[f"C{row}"].value)
            if not label:
                continue
            key = next((k for pat, k in OPEX_LABELS if re.search(pat, label, re.I)), None)
            if key is None:
                raise LayoutError(f"{p['sheet']}!C{row}: unknown cost label {label!r}")
            val = num(vs[f"{p['oc']}{row}"].value)
            opex[key] = opex.get(key, 0) + val
            opex_cells[key] = f"{p['oc']}{row}"
        hours = num(vs["D41"].value) * p.get("hours_factor", 1)
        rates = {"holidayPayPct": round(num(vs[f"{rc}8"].value) * 100, 4),
                 "agaPct": round(num(vs[f"{rc}9"].value) * 100, 4),
                 "otpPct": round(num(vs[f"{rc}11"].value) * 100, 4)}
        wb = {k: {"cell": c, "value": num(vs[c].value)} for k, c in p["wb"].items()}
        if "opex" in wb:
            excluded = round(sum(opex.values()) - wb["opex"]["value"], 2)
            if excluded:
                wb["opexExcludedByWorkbook"] = {"value": excluded,
                                               "note": "Workbook subtotal omits these lines (e.g. workwear); corrected here."}
        out.append({
            "id": p["id"], "label": p["sheet"] + (" – 2 ansatte" if p["id"] == "sotra-2" else ""),
            "sheet": p["sheet"], "historical": True,
            "input": {
                "revenueMode": "hourly", "hourlyRate": num(vs["D40"].value), "billableHours": hours, "fixedFee": 0,
                "rates": rates, "salaryIncludesHolidayPay": False,
                "employees": [{"name": f"Ressurs {i + 1}", "annualSalary": num(vs[c].value)} for i, c in enumerate(p["salaries"])],
                "opex": opex,
            },
            "cells": {"salaries": p["salaries"], "hourlyRate": "D40", "billableHours": "D41",
                      "rates": [f"{rc}8", f"{rc}9", f"{rc}11"], "opex": opex_cells},
            "workbook": wb,
            "notes": p["notes"],
        })
    return out


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--financial", required=True)
    ap.add_argument("--calculation", required=True)
    ap.add_argument("--year", type=int, required=True, help="reporting year (not stated in the workbook)")
    ap.add_argument("--out", required=True, help="JSON output path (outside the repository)")
    ap.add_argument("--base64", help="also write a base64 file for the NORMA_FIN_DATA variable")
    a = ap.parse_args()
    try:
        fin = extract_financial(a.financial, a.year)
        presets = extract_presets(a.calculation)
    except LayoutError as e:
        sys.exit(f"Layout check failed: {e}")
    data = {
        "schemaVersion": 1, "dataset": "real",
        "extractedAt": datetime.datetime.now(datetime.timezone.utc).isoformat(timespec="seconds"),
        **fin,
        "calculatorPresetsSource": "Kalkulacja zysku projektowego.xlsx",
        "calculatorPresets": presets,
    }
    text = json.dumps(data, ensure_ascii=False, indent=1)
    with open(a.out, "w", encoding="utf-8") as f:
        f.write(text)
    if a.base64:
        with open(a.base64, "w") as f:
            f.write(base64.b64encode(json.dumps(data, ensure_ascii=False, separators=(",", ":")).encode()).decode())
    print(f"OK – {len(presets)} presets, {sum(len(g['lines']) for g in fin['accounting']['costGroups'])} cost lines → {a.out}")


if __name__ == "__main__":
    main()
