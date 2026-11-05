const crypto = require("node:crypto");

class RecoveryError extends Error {
  constructor(code) { super(code); this.code = code; }
}
const deny = code => { throw new RecoveryError(code); };

function clusterFingerprint(connection) {
  const options = connection.getClient().options;
  const hosts = options.srvHost || (options.hosts || []).map(String).sort().join(",");
  if (!hosts) deny("CLUSTER_IDENTITY_UNAVAILABLE");
  return crypto.createHash("sha256").update(String(hosts).toLowerCase()).digest("hex");
}

function validateRecovery({ connection, database, expectedCluster, email, approvalRef, productionVerified, noRecoverableBackup, password }) {
  if (!database || connection.name !== database) deny("DATABASE_MISMATCH");
  if (!expectedCluster || clusterFingerprint(connection) !== expectedCluster) deny("CLUSTER_MISMATCH");
  if (!email || email !== email.trim().toLowerCase() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) deny("INVALID_TARGET_EMAIL");
  if (!productionVerified || !noRecoverableBackup || !approvalRef?.trim()) deny("OWNER_APPROVAL_REQUIRED");
  if (typeof password !== "string" || password.length < 12 || Buffer.byteLength(password, "utf8") > 72) deny("PASSWORD_LENGTH_INVALID");
}

// Only call after an owner has approved this exact cluster/database/email/action.
// Transaction support is mandatory; there is intentionally no non-transactional fallback.
async function recoverAdmin(options) {
  validateRecovery(options);
  const { connection, Admin, database, email, password, approvalRef } = options;
  const operationId = crypto.randomUUID();
  const session = await connection.startSession();
  let adminId;
  try {
    await session.withTransaction(async () => {
      const locks = connection.collection("admin_setup_locks");
      const lock = await locks.findOne({ _id: "first-admin" }, { session });
      if (!lock) deny("SETUP_LOCK_MISSING");
      if (Object.hasOwn(lock, "ownerRecovery")) deny("RECOVERY_ALREADY_USED");
      // Writing this same retained lock serializes concurrent recoveries.
      const claimed = await locks.updateOne(
        { _id: "first-admin", ownerRecovery: { $exists: false } },
        { $set: { ownerRecovery: { operationId, action: "initialize-locked-empty-admin", database, email, approvalRef, startedAt: new Date(), status: "in-progress" } } },
        { session },
      );
      if (claimed.modifiedCount !== 1) deny("RECOVERY_ALREADY_USED");
      if (await Admin.countDocuments({}).session(session) !== 0) deny("ADMIN_ALREADY_EXISTS");
      // The existing Admin pre-save hook performs bcrypt hashing exactly once.
      const [admin] = await Admin.create([{ name: "Ratan Mahal Admin", email, password,
        mustChangePassword: true, passwordVersion: 0,
        temporaryPasswordExpiresAt: new Date(Date.now() + 60 * 60 * 1000) }], { session });
      adminId = String(admin._id);
      const completed = await locks.updateOne(
        { _id: "first-admin", "ownerRecovery.operationId": operationId },
        { $set: { "ownerRecovery.status": "completed", "ownerRecovery.adminId": adminId, "ownerRecovery.completedAt": new Date() } },
        { session },
      );
      if (completed.modifiedCount !== 1) deny("AUDIT_COMPLETION_FAILED");
    }, { readConcern: { level: "snapshot" }, writeConcern: { w: "majority" }, readPreference: "primary" });
    return { operationId, adminId };
  } finally { await session.endSession(); }
}

module.exports = { RecoveryError, clusterFingerprint, validateRecovery, recoverAdmin };
