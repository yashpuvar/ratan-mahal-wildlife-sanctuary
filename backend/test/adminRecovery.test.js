const test = require("node:test");
const assert = require("node:assert/strict");
const mongoose = require("mongoose");
mongoose.set("autoCreate", false);
mongoose.set("autoIndex", false);
const ActualAdmin = require("../models/Admin");
const { recoverAdmin, clusterFingerprint } = require("../services/adminRecovery");

// In-memory transaction double: no database connections or writes.
function fixture({ count = 0, lock = { _id: "first-admin", createdAt: "retained" }, createFails = false, completionFails = false } = {}) {
  let state = { count, lock: structuredClone(lock), created: [] };
  let sessions = 0;
  let ended = 0;
  let transactionOptions;
  const session = {
    async withTransaction(callback, options) {
      transactionOptions = options;
      const snapshot = structuredClone(state);
      try { await callback(); } catch (error) { state = snapshot; throw error; }
    },
    async endSession() { ended++; },
  };
  const locks = {
    async findOne(query, options) { assert.equal(query._id, "first-admin"); assert.equal(options.session, session); return structuredClone(state.lock); },
    async updateOne(query, update, options) {
      assert.equal(options.session, session);
      assert.equal(query._id, "first-admin");
      if (query.ownerRecovery) {
        assert.deepEqual(query.ownerRecovery, { $exists: false });
        if (Object.hasOwn(state.lock, "ownerRecovery")) return { modifiedCount: 0 };
        state.lock.ownerRecovery = structuredClone(update.$set.ownerRecovery);
      } else {
        if (completionFails) return { modifiedCount: 0 };
        assert.equal(query["ownerRecovery.operationId"], state.lock.ownerRecovery.operationId);
        for (const [key, value] of Object.entries(update.$set)) state.lock.ownerRecovery[key.split(".")[1]] = value;
      }
      return { modifiedCount: 1 };
    },
  };
  const connection = {
    name: "FixtureDB",
    getClient: () => ({ options: { srvHost: "fixture-cluster.example.test" } }),
    collection(name) { assert.equal(name, "admin_setup_locks"); return locks; },
    async startSession() { sessions++; return session; },
  };
  const Admin = {
    countDocuments(query) { assert.deepEqual(query, {}); return { session: async supplied => { assert.equal(supplied, session); return state.count; } }; },
    async create(records, options) {
      assert.equal(options.session, session);
      if (createFails) throw new Error("private database details must not escape CLI");
      assert.equal(records.length, 1);
      assert.equal(records[0].mustChangePassword, true);
      assert.equal(records[0].passwordVersion, 0);
      assert.ok(records[0].temporaryPasswordExpiresAt > new Date());
      assert.ok(records[0].temporaryPasswordExpiresAt <= new Date(Date.now() + 3600000));
      // Do not store even fixture plaintext in the audit/state double.
      state.created.push({ email: records[0].email });
      state.count++;
      return [{ _id: "fixture-account-id" }];
    },
  };
  const options = { connection, Admin, database: "FixtureDB", expectedCluster: clusterFingerprint(connection), email: "owner@example.test",
    approvalRef: "fixture-approval", productionVerified: true, noRecoverableBackup: true, password: "Fixture-only-secret-123" };
  return { options, state: () => state, sessions: () => sessions, ended: () => ended, transactionOptions: () => transactionOptions };
}

test("approved recovery retains lock, records audit, and creates exactly one admin in majority transaction", async () => {
  const f = fixture();
  const result = await recoverAdmin(f.options);
  assert.equal(f.state().count, 1);
  assert.equal(f.state().lock._id, "first-admin");
  assert.equal(f.state().lock.createdAt, "retained");
  assert.equal(f.state().lock.ownerRecovery.status, "completed");
  assert.equal(f.state().lock.ownerRecovery.operationId, result.operationId);
  assert.equal(f.state().lock.ownerRecovery.adminId, result.adminId);
  assert.ok(!JSON.stringify(f.state().lock).includes(f.options.password));
  assert.deepEqual(f.transactionOptions(), { readConcern: { level: "snapshot" }, writeConcern: { w: "majority" }, readPreference: "primary" });
  assert.equal(f.ended(), 1);
});

for (const [name, change, code] of [
  ["database mismatch", { database: "OtherDB" }, "DATABASE_MISMATCH"],
  ["cluster mismatch", { expectedCluster: "wrong" }, "CLUSTER_MISMATCH"],
  ["missing owner approval", { approvalRef: "" }, "OWNER_APPROVAL_REQUIRED"],
  ["unverified production", { productionVerified: false }, "OWNER_APPROVAL_REQUIRED"],
  ["backup review missing", { noRecoverableBackup: false }, "OWNER_APPROVAL_REQUIRED"],
  ["invalid email", { email: "owner@example.test\n" }, "INVALID_TARGET_EMAIL"],
  ["short password", { password: "short" }, "PASSWORD_LENGTH_INVALID"],
  ["bcrypt truncation", { password: "é".repeat(37) }, "PASSWORD_LENGTH_INVALID"],
]) test(`rejects ${name} before any transaction`, async () => {
  const f = fixture();
  await assert.rejects(recoverAdmin({ ...f.options, ...change }), { code });
  assert.equal(f.sessions(), 0);
});

for (const [name, setup, code] of [
  ["missing setup lock", { lock: null }, "SETUP_LOCK_MISSING"],
  ["existing admin", { count: 1 }, "ADMIN_ALREADY_EXISTS"],
  ["used recovery", { lock: { _id: "first-admin", ownerRecovery: null } }, "RECOVERY_ALREADY_USED"],
  ["audit completion failure", { completionFails: true }, "AUDIT_COMPLETION_FAILED"],
]) test(`rejects ${name} and rolls back all transactional changes`, async () => {
  const f = fixture(setup);
  const before = structuredClone(f.state());
  await assert.rejects(recoverAdmin(f.options), { code });
  assert.deepEqual(f.state(), before);
  assert.equal(f.ended(), 1);
});

test("account creation failure rolls back the recovery marker", async () => {
  const f = fixture({ createFails: true });
  const before = structuredClone(f.state());
  await assert.rejects(recoverAdmin(f.options));
  assert.deepEqual(f.state(), before);
});

test("recovery cannot be reused even if its admin is later removed", async () => {
  const f = fixture();
  await recoverAdmin(f.options);
  f.state().count = 0;
  await assert.rejects(recoverAdmin(f.options), { code: "RECOVERY_ALREADY_USED" });
  assert.equal(f.state().created.length, 1);
});

test("actual Admin save hook bcrypt-hashes once and matchPassword accepts original password", async (t) => {
  let stored;
  t.mock.method(ActualAdmin.collection, "insertOne", async doc => {
    stored = doc.password;
    return { acknowledged: true, insertedId: doc._id };
  });
  const original = "Fixture-only-password-1234";
  const admin = new ActualAdmin({ name: "Fixture", email: "owner@example.test", password: original });
  await admin.save();
  assert.notEqual(stored, original);
  assert.match(stored, /^\$2[ab]\$10\$/);
  assert.equal(await admin.matchPassword(original), true);
  assert.equal(await admin.matchPassword("incorrect"), false);
});
