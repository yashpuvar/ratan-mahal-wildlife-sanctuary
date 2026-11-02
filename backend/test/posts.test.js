const test = require("node:test");
const assert = require("node:assert/strict");
const Post = require("../models/Post");
const { getPosts, getPostById } = require("../controllers/postController");

const records = [
  { _id: "6ae4657b506cb8dc7b77ac4b", image: "/images/posts/forested-hills-landscape.jpg", isPublished: true },
  { _id: "6aca19f90049eab38302404f", image: "https://images.pexels.com/photos/24589420/pexels-photo-24589420.jpeg", isPublished: true },
];
const response = () => ({ status(code) { this.code = code; return this; }, json(body) { this.body = body; } });

test("published posts API returns both original image references without pagination", async (t) => {
  t.mock.method(Post, "find", (filter) => {
    assert.deepEqual(filter, { isPublished: true });
    return { sort: async (order) => { assert.deepEqual(order, { createdAt: -1 }); return records; } };
  });
  const res = response();
  await getPosts({}, res);
  assert.equal(res.code, 200);
  assert.equal(res.body.count, 2);
  assert.deepEqual(res.body.data, records);
});

test("post detail preserves each saved image reference", async (t) => {
  t.mock.method(Post, "findById", async (id) => records.find(record => record._id === id));
  for (const post of records) {
    const res = response();
    await getPostById({ params: { id: post._id } }, res);
    assert.equal(res.code, 200);
    assert.deepEqual(res.body.data, post);
  }
});
