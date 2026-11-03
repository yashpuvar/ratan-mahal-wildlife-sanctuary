const test = require("node:test");
const assert = require("node:assert/strict");
const express = require("express");
const cors = require("cors");
const { createCorsOptions, PRODUCTION_ORIGIN } = require("../config/cors");
const Post = require("../models/Post");
const app = require("../server");

test("exact allowlist supports production and configured previews, never arbitrary Vercel sites", async (t) => {
  const preview = "https://ratan-mahal-reviewed-preview.vercel.app";
  const server = express().use(cors(createCorsOptions({ NODE_ENV: "production", FRONTEND_ORIGIN: ` ${preview}/, ${PRODUCTION_ORIGIN}/ ` })))
    .get("/api/posts", (req, res) => res.json({ success: true })).listen(0, "127.0.0.1");
  t.after(() => server.close());
  await new Promise(resolve => server.once("listening", resolve));
  const url = `http://127.0.0.1:${server.address().port}/api/posts`;
  for (const origin of [PRODUCTION_ORIGIN, preview, "https://untrusted.vercel.app", `${PRODUCTION_ORIGIN}.evil.example`, "null", "http://localhost:5173"]) {
    const res = await fetch(url, { headers: { Origin: origin } });
    assert.equal(res.status, 200);
    assert.equal(res.headers.get("access-control-allow-origin"), [PRODUCTION_ORIGIN, preview].includes(origin) ? origin : null);
    assert.match(res.headers.get("vary"), /Origin/);
  }
  const res = await fetch(url, { method: "OPTIONS", headers: { Origin: preview, "Access-Control-Request-Method": "POST", "Access-Control-Request-Headers": "authorization,content-type" } });
  assert.equal(res.status, 204);
  assert.equal(res.headers.get("access-control-allow-origin"), preview);
  assert.match(res.headers.get("access-control-allow-headers"), /Authorization/);
  assert.match(res.headers.get("access-control-allow-methods"), /POST/);
});

test("rejects wildcard and path-bearing configuration", () => {
  for (const origin of ["*", "https://*.vercel.app", "https://example.com/posts"]) {
    // URL accepts wildcard hostnames, so the configuration must reject them explicitly.
    assert.throws(() => createCorsOptions({ FRONTEND_ORIGIN: origin }));
  }
});

test("real Posts route returns two records with CORS, including error responses", async (t) => {
  const records = [{ _id: "one", title: "Forest", isPublished: true }, { _id: "two", title: "Bear", isPublished: true }];
  const find = t.mock.method(Post, "find", filter => {
    assert.deepEqual(filter, { isPublished: true });
    return { sort: async order => { assert.deepEqual(order, { createdAt: -1 }); return records; } };
  });
  const server = app.listen(0, "127.0.0.1");
  t.after(() => server.close());
  await new Promise(resolve => server.once("listening", resolve));
  const url = `http://127.0.0.1:${server.address().port}/api/posts`;
  const res = await fetch(url, { headers: { Origin: PRODUCTION_ORIGIN } });
  assert.equal(res.status, 200);
  assert.equal(res.headers.get("access-control-allow-origin"), PRODUCTION_ORIGIN);
  assert.deepEqual(await res.json(), { success: true, count: 2, data: records });
  find.mock.mockImplementation(() => { throw new Error("database unavailable"); });
  const failed = await fetch(url, { headers: { Origin: PRODUCTION_ORIGIN } });
  assert.equal(failed.status, 500);
  assert.equal(failed.headers.get("access-control-allow-origin"), PRODUCTION_ORIGIN);
});
