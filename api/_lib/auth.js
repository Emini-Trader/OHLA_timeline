/**
 * Server-side authentication for the financial section.
 *
 * Configuration (Vercel → Project → Settings → Environment Variables):
 *   FIN_PASSWORD_HASH   output of `npm run hash-password` (scrypt, never the plain password)
 *   FIN_SESSION_SECRET  random string, at least 32 characters
 *
 * A successful login sets an HttpOnly, Secure, SameSite=Strict cookie that
 * carries an expiry timestamp signed with HMAC-SHA256. No user data is stored.
 */
import { scryptSync, randomBytes, timingSafeEqual, createHmac } from "node:crypto";

export const COOKIE_NAME = "__Host-norma_fin";
export const SESSION_TTL_SECONDS = 8 * 60 * 60;
const SCRYPT = { N: 16384, r: 8, p: 1, keylen: 32 };

const b64u = buf => Buffer.from(buf).toString("base64url");

export function hashPassword(password, salt = randomBytes(16)) {
  const key = scryptSync(String(password), salt, SCRYPT.keylen, { N: SCRYPT.N, r: SCRYPT.r, p: SCRYPT.p });
  return ["scrypt", SCRYPT.N, SCRYPT.r, SCRYPT.p, b64u(salt), b64u(key)].join("$");
}

export function verifyPassword(password, stored) {
  if (typeof password !== "string" || typeof stored !== "string") return false;
  const parts = stored.split("$");
  if (parts.length !== 6 || parts[0] !== "scrypt") return false;
  const [, N, r, p, saltB64, keyB64] = parts;
  try {
    const expected = Buffer.from(keyB64, "base64url");
    const actual = scryptSync(password, Buffer.from(saltB64, "base64url"), expected.length,
      { N: Number(N), r: Number(r), p: Number(p), maxmem: 64 * 1024 * 1024 });
    return expected.length > 0 && timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}

export function authConfig(env = process.env) {
  const hash = env.FIN_PASSWORD_HASH || "";
  const secret = env.FIN_SESSION_SECRET || "";
  const configured = hash.startsWith("scrypt$") && secret.length >= 32;
  return { configured, hash, secret };
}

const sign = (payload, secret) => createHmac("sha256", secret).update(payload).digest("base64url");

export function createSessionToken(secret, now = Date.now(), ttl = SESSION_TTL_SECONDS) {
  const payload = `v1.${Math.floor(now / 1000) + ttl}`;
  return `${payload}.${sign(payload, secret)}`;
}

export function verifySessionToken(token, secret, now = Date.now()) {
  if (typeof token !== "string" || !secret) return false;
  const i = token.lastIndexOf(".");
  if (i < 0) return false;
  const payload = token.slice(0, i);
  const sig = Buffer.from(token.slice(i + 1));
  const expected = Buffer.from(sign(payload, secret));
  if (sig.length !== expected.length || !timingSafeEqual(sig, expected)) return false;
  const [v, exp] = payload.split(".");
  return v === "v1" && Number(exp) * 1000 > now;
}

/* Local development over plain http (scripts/dev-server.mjs sets FIN_DEV_INSECURE_COOKIE=1):
   browsers reject Secure / __Host- cookies on http://, so a non-Secure dev cookie is used.
   Never set this variable on Vercel. */
const devCookie = env => env.FIN_DEV_INSECURE_COOKIE === "1";
export const cookieName = (env = process.env) => (devCookie(env) ? "norma_fin_dev" : COOKIE_NAME);
const attrs = env => `Path=/; HttpOnly; ${devCookie(env) ? "" : "Secure; "}SameSite=Strict`;

export function sessionCookie(token, maxAge = SESSION_TTL_SECONDS, env = process.env) {
  return `${cookieName(env)}=${token}; ${attrs(env)}; Max-Age=${maxAge}`;
}

export const clearedCookie = (env = process.env) => `${cookieName(env)}=; ${attrs(env)}; Max-Age=0`;

/* Simple per-instance brute-force throttle (serverless instances are short-lived;
   this slows guessing but is not a substitute for a strong password). */
const failures = new Map();
const WINDOW_MS = 15 * 60 * 1000, MAX_FAILURES = 10;

export function isThrottled(ip, now = Date.now()) {
  const f = failures.get(ip);
  if (!f || now - f.first > WINDOW_MS) return false;
  return f.count >= MAX_FAILURES;
}
export function recordFailure(ip, now = Date.now()) {
  const f = failures.get(ip);
  if (!f || now - f.first > WINDOW_MS) failures.set(ip, { first: now, count: 1 });
  else f.count++;
}
export function resetFailures(ip) { failures.delete(ip); }
