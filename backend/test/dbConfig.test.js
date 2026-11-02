const test = require("node:test");
const assert = require("node:assert/strict");
const { validateMongoUri, connectionErrorMessage } = require("../config/db");
const mongoose = require("mongoose");
const connectDB = require("../config/db");

test("explicit database selection reaches the driver without rewriting the URI", async (t) => {
  const uri = "mongodb://127.0.0.1:27017/uriDatabase";
  const previousUri = process.env.MONGODB_URI;
  const previousDb = process.env.MONGODB_DB_NAME;
  t.after(() => {
    if (previousUri === undefined) delete process.env.MONGODB_URI;
    else process.env.MONGODB_URI = previousUri;
    if (previousDb === undefined) delete process.env.MONGODB_DB_NAME;
    else process.env.MONGODB_DB_NAME = previousDb;
  });
  process.env.MONGODB_URI = uri;
  const calls = [];
  t.mock.method(mongoose, "connect", async (...args) => { calls.push(args); });
  t.mock.method(console, "log", () => {});
  process.env.MONGODB_DB_NAME = " RatanMahal ";
  await connectDB();
  delete process.env.MONGODB_DB_NAME;
  await connectDB();
  assert.deepEqual(calls, [[uri, { dbName: "RatanMahal" }], [uri, {}]]);
});

test("accepts local, Atlas encoded credentials, and multi-host URIs", () => {
  for (const uri of [
    "mongodb://127.0.0.1:27017/ratanmahal",
    "mongodb+srv://user:p%40ss%23word@cluster.example.mongodb.net/ratanmahal",
    "mongodb://host1:27017,host2:27017/ratanmahal?replicaSet=rs0",
  ]) assert.doesNotThrow(() => validateMongoUri(uri));
});

test("invalid URI errors never include the supplied credentials", () => {
  for (const uri of [undefined, "https://user:private-password@host/db", "mongodb+srv://user:<password>@host/db", "mongodb://user:private-password@/db"]) {
    assert.throws(() => validateMongoUri(uri), (error) => !error.message.includes("private-password"));
  }
});

test("driver error details are omitted while auth failures are actionable", () => {
  const secret = "mongodb+srv://user:private-password@host/db";
  for (const error of [
    { code: 18, message: secret },
    { code: 8000, message: "bad auth " + secret },
    { name: "MongoParseError", message: secret },
    { name: "MongoServerSelectionError", message: secret },
  ]) assert.ok(!connectionErrorMessage(error).includes(secret));
  assert.match(connectionErrorMessage({ code: 18 }), /Atlas Database Access/);
});
