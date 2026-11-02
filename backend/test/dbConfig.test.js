const test = require("node:test");
const assert = require("node:assert/strict");
const { validateMongoUri, connectionErrorMessage } = require("../config/db");

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
