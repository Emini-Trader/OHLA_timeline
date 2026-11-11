// Consistency checks for the Teamstruktur dataset (public/js/team/team-data.mjs).
import test from "node:test";
import assert from "node:assert/strict";
import {
  ORGANIZATIONS, ROLES, RELATIONSHIPS, RELATIONSHIP_TYPES, STAGES, TOOLS, CONTINUITY, NOTES,
} from "../public/js/team/team-data.mjs";

const ids = new Set([...ORGANIZATIONS, ...ROLES].map(x => x.id).concat("trimble"));
const role = id => ROLES.find(r => r.id === id);
const bilingual = o => o && typeof o.no === "string" && o.no && typeof o.en === "string" && o.en;

test("current NORMA team = the four allocations from the workbook", () => {
  const current = ROLES.filter(r => r.status === "current");
  assert.deepEqual(current.map(r => [r.id, r.allocationPct]),
    [["lead", 100], ["qs", 50], ["field1", 75], ["field2", 75]]);
  assert.ok(current.every(r => r.org === "norma"));
  assert.deepEqual(ROLES.filter(r => r.contractualBaseline).map(r => r.id), ["lead", "qs"]);
});

test("planned items are not shown as deployed", () => {
  assert.equal(role("tunnel").status, "planned");
  assert.equal(role("tunnel").allocationPct, 100);
  for (const id of ["field1", "field2"]) {
    assert.equal(role(id).allocationPct, 75, "current allocation stays 75 %");
    assert.equal(role(id).plannedAllocationPct, 100);
  }
  for (const r of RELATIONSHIPS.filter(x => x.from === "tunnel" || x.to === "tunnel")) assert.equal(r.status, "planned", r.id);
  assert.equal(STAGES.find(s => s.id === "planned").status, "planned");
});

test("METROSTAV is an external collaborator, not NORMA personnel", () => {
  const m = ORGANIZATIONS.find(o => o.id === "metrostav");
  assert.equal(m.internal, false);
  assert.equal(m.source.label, "METROSTAV 100%"); // traceability kept
  assert.ok(!ROLES.some(r => r.id === "metrostav" || r.org === "metrostav"));
  const links = RELATIONSHIPS.filter(r => r.from === "metrostav" || r.to === "metrostav").map(r => r.type);
  assert.ok(!links.includes("internal") && !links.includes("backup"));
  assert.ok(links.includes("cooperation"));
});

test("relationship semantics: no management lines to external parties", () => {
  for (const r of RELATIONSHIPS) {
    assert.ok(RELATIONSHIP_TYPES.includes(r.type), r.id);
    assert.ok(ids.has(r.from) && ids.has(r.to), `${r.id} endpoints`);
    assert.ok(bilingual(r.label), `${r.id} label`);
    const external = [r.from, r.to].some(id => ORGANIZATIONS.find(o => o.id === id && !o.internal));
    if (r.type === "internal" || r.type === "backup") assert.ok(!external, `${r.id} must stay inside NORMA`);
  }
  const svv = RELATIONSHIPS.find(r => r.id === "svv-qs");
  assert.equal(svv.type, "communication");
  assert.ok(bilingual(svv.note), "scope note present");
  assert.equal(RELATIONSHIPS.find(r => r.id === "ohla-lead").type, "coordination");
});

test("backup is temporary coverage from the Lead Surveyor only", () => {
  const backup = RELATIONSHIPS.filter(r => r.type === "backup");
  assert.deepEqual(backup.map(r => r.to).sort(), ["field1", "field2", "tunnel"]);
  assert.ok(backup.every(r => r.from === "lead"));
  assert.ok(CONTINUITY.points.length >= 4 && CONTINUITY.points.every(bilingual));
});

test("no invented dates; every text is bilingual; every workbook item is traceable", () => {
  const dateLike = /\b(19|20)\d{2}\b|\b\d{1,2}\.\d{1,2}\.\d{2,4}\b/;
  for (const s of STAGES) {
    assert.ok(bilingual(s.title) && bilingual(s.text), s.id);
    assert.ok(!dateLike.test(s.text.no) && !dateLike.test(s.text.en), `${s.id} has no dates`);
  }
  for (const r of ROLES) {
    assert.ok(bilingual(r.title), r.id);
    assert.ok(r.source?.cells && r.source?.label, `${r.id} source`);
  }
  for (const o of ORGANIZATIONS.filter(o => !o.internal)) assert.ok(o.source?.cells, o.id);
  assert.deepEqual(TOOLS.map(t => t.source.label).sort(), ["AUTOCAD", "GISLINE", "Gemini", "TRIMBLE Connect Web"]);
  assert.deepEqual(TOOLS.filter(t => t.group === "platform").map(t => t.id), ["trimble"]);
  assert.ok(NOTES.every(bilingual));
});
