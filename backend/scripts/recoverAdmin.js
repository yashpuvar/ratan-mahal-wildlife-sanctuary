const path = require("node:path");
const crypto = require("node:crypto");
const readline = require("node:readline");
const { parseArgs } = require("node:util");
const mongoose = require("mongoose");

// Even plan mode must not auto-create collections or indexes.
mongoose.set("autoCreate", false);
mongoose.set("autoIndex", false);
require("dotenv").config({ path: path.join(__dirname, "..", ".env"), quiet: true });
const Admin = require("../models/Admin");
const { resolveDatabaseName, validateMongoUri } = require("../config/db");
const { RecoveryError, clusterFingerprint, recoverAdmin } = require("../services/adminRecovery");

function hiddenPrompt(label) {
  if (!process.stdin.isTTY || !process.stdout.isTTY) throw new RecoveryError("INTERACTIVE_TERMINAL_REQUIRED");
  return new Promise((resolve, reject) => {
    let value = "";
    process.stdout.write(label);
    readline.emitKeypressEvents(process.stdin);
    process.stdin.setRawMode(true);
    process.stdin.resume();
    const finish = (error) => {
      process.stdin.off("keypress", onKey);
      process.stdin.setRawMode(false);
      process.stdin.pause();
      process.stdout.write("\n");
      if (error) reject(error); else resolve(value);
      value = "";
    };
    const onKey = (text, key = {}) => {
      if (key.ctrl && key.name === "c") return finish(new RecoveryError("CANCELLED"));
      if (key.name === "return" || key.name === "enter") return finish();
      if (key.name === "backspace") { value = Array.from(value).slice(0, -1).join(""); return; }
      if (!key.ctrl && !key.meta && text && !/[\x00-\x1f\x7f]/.test(text)) value += text;
    };
    process.stdin.on("keypress", onKey);
  });
}

async function main() {
  const { values } = parseArgs({ options: {
    database: { type: "string" }, email: { type: "string" }, "cluster-fingerprint": { type: "string" },
    "approval-ref": { type: "string" }, execute: { type: "boolean", default: false },
    "production-verified": { type: "boolean", default: false }, "no-recoverable-backup": { type: "boolean", default: false },
  } });
  validateMongoUri(process.env.MONGODB_URI);
  // Connect to the configured database; an expected database cannot silently override it.
  const dbName = resolveDatabaseName(process.env.MONGODB_URI, process.env.MONGODB_DB_NAME);
  await mongoose.connect(process.env.MONGODB_URI, { ...(dbName ? { dbName } : {}), autoCreate: false, autoIndex: false, serverSelectionTimeoutMS: 15000 });
  const connection = mongoose.connection;
  const fingerprint = clusterFingerprint(connection);
  const lock = await connection.collection("admin_setup_locks").findOne({ _id: "first-admin" }, { projection: { ownerRecovery: 1 } });
  const adminCount = await Admin.countDocuments();
  console.log(JSON.stringify({ mode: values.execute ? "execution-preflight" : "read-only-plan", database: connection.name, clusterFingerprint: fingerprint,
    adminCount, firstAdminLockExists: Boolean(lock), recoveryPreviouslyUsed: Boolean(lock && Object.hasOwn(lock, "ownerRecovery")) }));
  if (!values.execute) return;
  if (!process.stdin.isTTY || !process.stdout.isTTY) throw new RecoveryError("INTERACTIVE_TERMINAL_REQUIRED");
  if (!values["production-verified"] || !values["no-recoverable-backup"] || !values["approval-ref"] || !values.email ||
      values.database !== connection.name || values["cluster-fingerprint"] !== fingerprint) throw new RecoveryError("OWNER_APPROVAL_OR_TARGET_MISSING");
  if (!lock || Object.hasOwn(lock, "ownerRecovery") || adminCount !== 0) throw new RecoveryError("NOT_LOCKED_EMPTY_STATE");
  // The server-side restrictions must be deployed before a temporary account exists.
  try {
    const health = await fetch("https://ratan-mahal-backend.onrender.com/api/health", { redirect: "error", signal: AbortSignal.timeout(30000) });
    if (!health.ok || (await health.json()).adminRecoveryProtocol !== 1) throw new Error();
  } catch { throw new RecoveryError("PASSWORD_CHANGE_PROTECTION_NOT_DEPLOYED"); }
  const terminal = readline.createInterface({ input: process.stdin, output: process.stdout });
  const phrase = `RECOVER ${values.database} ${values.email} ${fingerprint}`;
  const confirmation = await new Promise(resolve => terminal.question(`Owner approval required. Type exactly:\n${phrase}\n> `, resolve));
  terminal.close();
  if (confirmation !== phrase) throw new RecoveryError("CONFIRMATION_MISMATCH");
  let password;
  let result;
  try {
    // Run --execute only in the owner's PRIVATE local terminal, never in agent
    // tools, recordings, CI or a deployment shell whose output is captured.
    password = crypto.randomBytes(24).toString("base64url");
    result = await recoverAdmin({ connection, Admin, database: values.database, expectedCluster: fingerprint, email: values.email,
      approvalRef: values["approval-ref"], productionVerified: values["production-verified"], noRecoverableBackup: values["no-recoverable-backup"], password });
    console.log(JSON.stringify({ event: "owner-admin-recovery-committed", operationId: result.operationId }));
    process.stdout.write(`\nPRIVATE TERMINAL ONLY — save in your password manager.\nAdmin email: ${values.email}\nTemporary password: ${password}\nExpires in one hour. You must replace it before using the dashboard.\n\n`);
    // Explicit production endpoint only; never send a new password to an arbitrary CLI URL.
    try {
      const response = await fetch("https://ratan-mahal-backend.onrender.com/api/admin/login", { method: "POST", redirect: "error",
        signal: AbortSignal.timeout(30000), headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: values.email, password }) });
      const body = await response.json();
      if (!response.ok || !body.success || body.admin?.id !== result.adminId || body.admin?.email !== values.email || !body.admin.mustChangePassword || !body.token) throw new Error();
      const me = await fetch("https://ratan-mahal-backend.onrender.com/api/admin/me", { redirect: "error", signal: AbortSignal.timeout(30000), headers: { Authorization: `Bearer ${body.token}` } });
      const identity = await me.json();
      if (!me.ok || identity.admin?.id !== result.adminId || identity.admin?.role !== "admin" || !identity.admin.mustChangePassword) throw new Error();
      const protectedApi = await fetch("https://ratan-mahal-backend.onrender.com/api/contacts", { redirect: "error", signal: AbortSignal.timeout(30000), headers: { Authorization: `Bearer ${body.token}` } });
      if (protectedApi.status !== 403 || (await protectedApi.json()).code !== "ADMIN_PASSWORD_CHANGE_REQUIRED") throw new Error();
      console.log("Production temporary login and /me verified; normal admin APIs remain blocked until password change. No token was printed or saved.");
    } catch {
      console.error("Account recovery committed, but production login verification is incomplete. Do not rerun recovery; investigate the deployment/database connection.");
      process.exitCode = 1;
    }
  } finally { password = undefined; }
}

if (require.main === module) main().catch(error => {
  // Raw database/validation errors can contain documents, passwords or connection strings.
  console.error(JSON.stringify({ event: "owner-admin-recovery-not-confirmed", code: error instanceof RecoveryError ? error.code : "OPERATION_FAILED_RECHECK_STATE" }));
  process.exitCode = 1;
}).finally(async () => { await mongoose.disconnect(); });

module.exports = { hiddenPrompt };
