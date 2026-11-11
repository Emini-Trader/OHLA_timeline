// Static checks run before deployment (npm run build):
//  1. every JS module parses (node --check),
//  2. nothing that could hold confidential data is inside the publicly served public/ folder.
import { readdirSync, statSync } from "node:fs";
import { join, extname, relative } from "node:path";
import { execFileSync } from "node:child_process";

const ROOT = new URL("..", import.meta.url).pathname;
const walk = dir => readdirSync(dir).flatMap(n => {
  const p = join(dir, n);
  if (n === "node_modules" || n === ".git") return [];
  return statSync(p).isDirectory() ? walk(p) : [p];
});

let failed = false;
for (const f of walk(ROOT).filter(f => [".js", ".mjs"].includes(extname(f)))) {
  try { execFileSync(process.execPath, ["--check", f], { stdio: "pipe" }); }
  catch (e) { failed = true; console.error(`Syntax error in ${relative(ROOT, f)}\n${e.stderr}`); }
}

const ALLOWED = new Set([".html", ".css", ".js", ".mjs", ".png", ".svg", ".ico", ".woff2"]);
for (const f of walk(join(ROOT, "public"))) {
  if (!ALLOWED.has(extname(f).toLowerCase())) {
    failed = true;
    console.error(`Not allowed in public/: ${relative(ROOT, f)} (data and spreadsheets must stay out of the served folder)`);
  }
}
if (failed) process.exit(1);
console.log("check: OK");
