/**
 * Loads the financial dataset on the server.
 *
 * Real data is never stored in Git (the repository is public). It is provided
 * as the environment variable NORMA_FIN_DATA – base64-encoded JSON produced by
 * `python3 scripts/extract_financials.py` – and is only returned to clients
 * with a valid session (see api/financials.js).
 */
import { validateFinancialData } from "../../public/js/finance/schema.mjs";
import { SAMPLE_DATA } from "./sample-data.js";

export function hasRealData(env = process.env) {
  return typeof env.NORMA_FIN_DATA === "string" && env.NORMA_FIN_DATA.trim().length > 0;
}

export function decodeDataset(raw) {
  const text = raw.trim().startsWith("{") ? raw : Buffer.from(raw.trim(), "base64").toString("utf8");
  return JSON.parse(text);
}

let cache = null;

/** Returns {data} or throws an Error with `.publicMessage`. */
export function loadDataset(env = process.env) {
  if (!hasRealData(env)) return { data: SAMPLE_DATA };
  if (cache && cache.raw === env.NORMA_FIN_DATA) return { data: cache.data };
  let data;
  try {
    data = decodeDataset(env.NORMA_FIN_DATA);
  } catch {
    throw Object.assign(new Error("NORMA_FIN_DATA is not valid base64/JSON"), { publicMessage: "dataset_invalid" });
  }
  const v = validateFinancialData(data);
  if (!v.ok || data.dataset !== "real") {
    throw Object.assign(new Error(`NORMA_FIN_DATA failed validation: ${v.errors.join("; ")}`), { publicMessage: "dataset_invalid" });
  }
  cache = { raw: env.NORMA_FIN_DATA, data };
  return { data };
}
