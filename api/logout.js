/** POST /api/logout → clears the session cookie. */
import { sendJson } from "./_lib/http.js";
import { clearedCookie } from "./_lib/auth.js";

export default async function handler(req, res, env = process.env) {
  if (req.method !== "POST") return sendJson(res, 405, { error: "method_not_allowed" }, { Allow: "POST" });
  return sendJson(res, 200, { ok: true }, { "Set-Cookie": clearedCookie(env) });
}
