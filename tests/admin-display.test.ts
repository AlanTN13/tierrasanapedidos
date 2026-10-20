import assert from "node:assert/strict";
import test from "node:test";
import { costState, matchesAdminDate, normalizeAdminText, formatAdminDateTime } from "../lib/admin-display.ts";

test("missing and invalid costs never imply a complete margin", () => {
  assert.equal(costState([]), "missing");
  assert.equal(costState([{unitCostSnapshotCents:0,usesEstimatedCost:false}]), "missing");
  assert.equal(costState([{unitCostSnapshotCents:NaN,usesEstimatedCost:false}]), "missing");
  assert.equal(costState([{unitCostSnapshotCents:100,usesEstimatedCost:true},{unitCostSnapshotCents:0,usesEstimatedCost:false}]), "missing");
});
test("registered and estimated costs retain their provenance", () => {
  assert.equal(costState([{unitCostSnapshotCents:100,usesEstimatedCost:false}]), "registered");
  assert.equal(costState([{unitCostSnapshotCents:100,usesEstimatedCost:true}]), "estimated");
});
test("date filters use inclusive Argentine calendar dates around UTC midnight", () => {
  assert.equal(matchesAdminDate("2026-10-20T02:59:59Z","2026-10-19","2026-10-19"),true);
  assert.equal(matchesAdminDate("2026-10-20T03:00:00Z","2026-10-19","2026-10-19"),false);
  assert.equal(matchesAdminDate("2026-10-20T03:00:00Z","2026-10-20","2026-10-20"),true);
  assert.equal(matchesAdminDate("2026-10-21T03:00:00Z","2026-10-20","2026-10-20"),false);
  assert.equal(matchesAdminDate("bad","2026-10-20",""),false);
});
test("search accepts accents, whitespace and absent customer names", () => {
  assert.equal(normalizeAdminText("  CHÍA  "),"chia");
  assert.equal(normalizeAdminText(null),"");
});

test("admin date output has Argentine time and stable whitespace for hydration", () => {
  const label = formatAdminDateTime("2026-10-20T02:15:00Z");
  assert.match(label, /19/);
  assert.match(label, /23:15/);
  assert.doesNotMatch(label, /[\u00a0\u202f]/);
});
