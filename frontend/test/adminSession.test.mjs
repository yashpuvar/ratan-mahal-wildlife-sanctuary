import test from "node:test";
import assert from "node:assert/strict";
import { clearAdminSession } from "../src/lib/adminSession.js";

test("admin logout removes the token and cached admin data and dispatches auth change", () => {
  const stored = new Map([["adminToken", "test-token"], ["adminData", "test-admin"], ["token", "public-user-token"]]);
  const storage = { removeItem: (key) => stored.delete(key) };
  let eventCount = 0;
  clearAdminSession(storage, () => { eventCount += 1; });
  assert.equal(stored.has("adminToken"), false);
  assert.equal(stored.has("adminData"), false);
  assert.equal(stored.has("token"), true);
  assert.equal(eventCount, 1);
});
