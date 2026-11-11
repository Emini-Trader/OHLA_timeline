/** POST /api/login  {"password": "..."}  → sets the session cookie. */
import { sendJson, readJson, clientIp } from "./_lib/http.js";
import {
  authConfig, verifyPassword, createSessionToken, sessionCookie,
  isThrottled, recordFailure, resetFailures,
} from "./_lib/auth.js";

const delay = ms => new Promise(r => setTimeout(r, ms));

export default async function handler(req, res, env = process.env) {
  if (req.method !== "POST") return sendJson(res, 405, { error: "method_not_allowed" }, { Allow: "POST" });
  const ct = String(req.headers?.["content-type"] || "");
  if (!ct.includes("application/json")) return sendJson(res, 415, { error: "json_required" });

  const auth = authConfig(env);
  if (!auth.configured) return sendJson(res, 503, { error: "auth_not_configured" });

  const ip = clientIp(req);
  if (isThrottled(ip)) return sendJson(res, 429, { error: "too_many_attempts" });

  let body;
  try { body = await readJson(req); } catch (e) { return sendJson(res, e.status || 400, { error: "bad_request" }); }

  if (!verifyPassword(body?.password, auth.hash)) {
    recordFailure(ip);
    await delay(env.FIN_LOGIN_DELAY_MS ? Number(env.FIN_LOGIN_DELAY_MS) : 400);
    return sendJson(res, 401, { error: "invalid_credentials" });
  }
  resetFailures(ip);
  return sendJson(res, 200, { ok: true }, { "Set-Cookie": sessionCookie(createSessionToken(auth.secret), undefined, env) });
}
