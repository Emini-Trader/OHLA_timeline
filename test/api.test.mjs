// Access-control tests for the serverless functions (no real data involved).
import test from "node:test";
import assert from "node:assert/strict";
import financials from "../api/financials.js";
import login from "../api/login.js";
import logout from "../api/logout.js";
import { hashPassword, createSessionToken, COOKIE_NAME, verifyPassword, verifySessionToken } from "../api/_lib/auth.js";
import { SAMPLE_DATA } from "../api/_lib/sample-data.js";
import { validateFinancialData } from "../public/js/finance/schema.mjs";

const PASSWORD = "correct horse battery staple";
const SECRET = "x".repeat(40);
const HASH = hashPassword(PASSWORD);
const realLike = Buffer.from(JSON.stringify({ ...SAMPLE_DATA, dataset: "real" })).toString("base64");
let ipCounter = 0;

function req({ method = "GET", cookie, body, contentType = "application/json", ip } = {}) {
  return { method, body, headers: { cookie, "content-type": contentType, "x-forwarded-for": ip || `10.0.0.${++ipCounter}` } };
}
function res() {
  return {
    statusCode: 0, headers: {}, body: "",
    setHeader(k, v) { this.headers[k.toLowerCase()] = v; },
    end(b) { this.body = b ?? ""; },
    json() { return JSON.parse(this.body); },
  };
}
async function call(handler, r, env) { const out = res(); await handler(r, out, env); return out; }

test("sample data is served when neither auth nor real data is configured", async () => {
  const r = await call(financials, req(), {});
  assert.equal(r.statusCode, 200);
  assert.equal(r.json().data.dataset, "sample");
  assert.equal(r.headers["cache-control"], "no-store, max-age=0");
  assert.equal(r.headers["x-robots-tag"], "noindex, nofollow");
});

test("real data without configured auth is refused (fail closed)", async () => {
  const r = await call(financials, req(), { NORMA_FIN_DATA: realLike });
  assert.equal(r.statusCode, 503);
  assert.equal(r.json().data, undefined);
  assert.ok(!r.body.includes("Salgsinntekter"));
});

test("unauthenticated, forged and expired sessions get 401 and no data", async () => {
  const env = { NORMA_FIN_DATA: realLike, FIN_PASSWORD_HASH: HASH, FIN_SESSION_SECRET: SECRET };
  for (const cookie of [undefined, `${COOKIE_NAME}=v1.9999999999.forged`,
    `${COOKIE_NAME}=${createSessionToken("y".repeat(40))}`,
    `${COOKIE_NAME}=${createSessionToken(SECRET, Date.now() - 9 * 3600 * 1000)}`]) {
    const r = await call(financials, req({ cookie }), env);
    assert.equal(r.statusCode, 401, `cookie ${cookie}`);
    assert.equal(r.json().data, undefined);
  }
});

test("login flow: wrong password 401, correct password sets a secure cookie that unlocks data", async () => {
  const env = { NORMA_FIN_DATA: realLike, FIN_PASSWORD_HASH: HASH, FIN_SESSION_SECRET: SECRET, FIN_LOGIN_DELAY_MS: "0" };
  const bad = await call(login, req({ method: "POST", body: { password: "nope" } }), env);
  assert.equal(bad.statusCode, 401);
  assert.equal(bad.headers["set-cookie"], undefined);

  const ok = await call(login, req({ method: "POST", body: { password: PASSWORD } }), env);
  assert.equal(ok.statusCode, 200);
  const cookie = ok.headers["set-cookie"];
  for (const attr of ["HttpOnly", "Secure", "SameSite=Strict", "Path=/"]) assert.ok(cookie.includes(attr), attr);

  const data = await call(financials, req({ cookie: cookie.split(";")[0] }), env);
  assert.equal(data.statusCode, 200);
  assert.equal(data.json().data.dataset, "real");
  assert.equal(data.json().authRequired, true);

  const out = await call(logout, req({ method: "POST" }), env);
  assert.ok(out.headers["set-cookie"].includes("Max-Age=0"));
});

test("sample data also requires login once auth is configured", async () => {
  const env = { FIN_PASSWORD_HASH: HASH, FIN_SESSION_SECRET: SECRET };
  assert.equal((await call(financials, req(), env)).statusCode, 401);
});

test("login rejects wrong methods, non-JSON bodies and unconfigured auth", async () => {
  const env = { FIN_PASSWORD_HASH: HASH, FIN_SESSION_SECRET: SECRET };
  assert.equal((await call(login, req({ method: "GET" }), env)).statusCode, 405);
  assert.equal((await call(login, req({ method: "POST", contentType: "text/plain", body: "x" }), env)).statusCode, 415);
  assert.equal((await call(login, req({ method: "POST", body: { password: PASSWORD } }), {})).statusCode, 503);
  assert.equal((await call(login, req({ method: "POST", body: { password: PASSWORD } }), { FIN_PASSWORD_HASH: HASH, FIN_SESSION_SECRET: "short" })).statusCode, 503);
  assert.equal((await call(financials, req({ method: "POST" }), {})).statusCode, 405);
});

test("repeated failures are throttled", async () => {
  const env = { FIN_PASSWORD_HASH: HASH, FIN_SESSION_SECRET: SECRET, FIN_LOGIN_DELAY_MS: "0" };
  const ip = "192.0.2.99";
  for (let i = 0; i < 10; i++) await call(login, req({ method: "POST", body: { password: "x" }, ip }), env);
  assert.equal((await call(login, req({ method: "POST", body: { password: PASSWORD }, ip }), env)).statusCode, 429);
});

test("an invalid dataset is not served", async () => {
  const env = { NORMA_FIN_DATA: Buffer.from('{"dataset":"real"}').toString("base64"), FIN_PASSWORD_HASH: HASH, FIN_SESSION_SECRET: SECRET };
  const r = await call(financials, req({ cookie: `${COOKIE_NAME}=${createSessionToken(SECRET)}` }), env);
  assert.equal(r.statusCode, 500);
  assert.deepEqual(r.json(), { error: "dataset_invalid" });
});

test("dev cookie mode is opt-in; production cookie is Secure", async () => {
  const env = { FIN_PASSWORD_HASH: HASH, FIN_SESSION_SECRET: SECRET, FIN_LOGIN_DELAY_MS: "0" };
  const prod = await call(login, req({ method: "POST", body: { password: PASSWORD } }), env);
  assert.match(prod.headers["set-cookie"], /^__Host-norma_fin=.*; Secure;/);
  const dev = await call(login, req({ method: "POST", body: { password: PASSWORD } }), { ...env, FIN_DEV_INSECURE_COOKIE: "1" });
  assert.match(dev.headers["set-cookie"], /^norma_fin_dev=/);
  assert.ok(!dev.headers["set-cookie"].includes("Secure"));
  // a dev cookie does not unlock a production deployment
  const r = await call(financials, req({ cookie: dev.headers["set-cookie"].split(";")[0] }), env);
  assert.equal(r.statusCode, 401);
});

test("password hashing and session tokens", () => {
  assert.ok(verifyPassword(PASSWORD, HASH));
  assert.ok(!verifyPassword(PASSWORD + "!", HASH));
  assert.ok(!verifyPassword(PASSWORD, "plain-text"));
  assert.ok(!HASH.includes(PASSWORD));
  const tok = createSessionToken(SECRET);
  assert.ok(verifySessionToken(tok, SECRET));
  assert.ok(!verifySessionToken(tok.replace(/.$/, c => (c === "A" ? "B" : "A")), SECRET));
});

test("sample dataset is valid and clearly flagged", () => {
  const v = validateFinancialData(SAMPLE_DATA);
  assert.deepEqual(v.errors, []);
  assert.equal(SAMPLE_DATA.dataset, "sample");
  const broken = structuredClone(SAMPLE_DATA);
  broken.accounting.revenue.values.pop();
  assert.equal(validateFinancialData(broken).ok, false);
  const mismatch = structuredClone(SAMPLE_DATA);
  mismatch.accounting.workbookTotals = { revenue: { cell: "L4", value: 1 } };
  assert.match(validateFinancialData(mismatch).errors.join(), /revenue/);
});
