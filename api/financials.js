/**
 * GET /api/financials
 *
 * Access policy (fail closed):
 *  - real data configured, authentication NOT configured → 503 (nothing served)
 *  - authentication configured, no valid session        → 401
 *  - otherwise                                           → 200 with dataset
 * Without real data and without authentication only the synthetic sample
 * dataset (flagged dataset: "sample") is served.
 */
import { sendJson, parseCookies } from "./_lib/http.js";
import { authConfig, verifySessionToken, cookieName } from "./_lib/auth.js";
import { hasRealData, loadDataset } from "./_lib/data.js";

export default async function handler(req, res, env = process.env) {
  if (req.method !== "GET") return sendJson(res, 405, { error: "method_not_allowed" }, { Allow: "GET" });

  const auth = authConfig(env);
  const real = hasRealData(env);

  if (real && !auth.configured) {
    return sendJson(res, 503, { error: "auth_not_configured" });
  }
  if (auth.configured) {
    const token = parseCookies(req)[cookieName(env)];
    if (!verifySessionToken(token, auth.secret)) {
      return sendJson(res, 401, { error: "unauthenticated", authRequired: true });
    }
  }

  try {
    const { data } = loadDataset(env);
    return sendJson(res, 200, { authRequired: auth.configured, data });
  } catch (e) {
    console.error(e.message);
    return sendJson(res, 500, { error: e.publicMessage || "server_error" });
  }
}
