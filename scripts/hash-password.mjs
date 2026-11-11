// Usage: npm run hash-password            (prompts, input hidden)
//        printf '%s' "$PW" | npm run hash-password --silent
// Prints a scrypt hash for the FIN_PASSWORD_HASH environment variable and a
// random value suitable for FIN_SESSION_SECRET.
import { randomBytes } from "node:crypto";
import { hashPassword } from "../api/_lib/auth.js";

async function readPassword() {
  if (!process.stdin.isTTY) {
    let s = "";
    for await (const c of process.stdin) s += c;
    return s.replace(/\r?\n$/, "");
  }
  process.stdout.write("Password: ");
  process.stdin.setRawMode(true);
  let pw = "";
  for await (const chunk of process.stdin) {
    for (const ch of chunk.toString("utf8")) {
      if (ch === "\r" || ch === "\n") { process.stdin.setRawMode(false); process.stdout.write("\n"); return pw; }
      if (ch === "\u0003") process.exit(1);
      if (ch === "\u007f") pw = pw.slice(0, -1); else pw += ch;
    }
  }
  return pw;
}

const pw = await readPassword();
if (pw.length < 12) { console.error("Use at least 12 characters."); process.exit(1); }
console.log(`FIN_PASSWORD_HASH=${hashPassword(pw)}`);
console.log(`FIN_SESSION_SECRET=${randomBytes(32).toString("base64url")}`);
process.exit(0);
