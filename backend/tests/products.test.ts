import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import mongoose from "mongoose";
import { createApp } from "../src/app";
import { ProductModel } from "../src/models/Product";
import { config } from "../src/config";

const app = createApp();

before(async () => {
  await mongoose.connect(config.testMongoUri);
  await ProductModel.deleteMany({});
  await ProductModel.insertMany([
    {
      sourceId: 9001,
      title: "Test Shirt",
      price: 19.99,
      description: "A shirt",
      category: "clothing",
      image: "/images/test-shirt.png",
      rating: { rate: 4.5, count: 10 },
    },
    {
      sourceId: 9002,
      title: "Test Mug",
      price: 9.99,
      description: "A mug",
      category: "home",
      image: "/images/test-mug.png",
      rating: { rate: 3.5, count: 5 },
    },
  ]);
});

after(async () => {
  await ProductModel.deleteMany({ sourceId: { $gte: 9000 } });
  await mongoose.disconnect();
});

describe("GET /api/products", () => {
  it("returns a paginated list", async () => {
    const res = await request(app).get("/api/products");
    assert.equal(res.status, 200);
    assert.equal(res.body.total, 2);
    assert.equal(res.body.items.length, 2);
  });

  it("filters by category", async () => {
    const res = await request(app).get("/api/products?category=clothing");
    assert.equal(res.status, 200);
    assert.equal(res.body.total, 1);
    assert.equal(res.body.items[0].category, "clothing");
  });

  it("rejects invalid query params", async () => {
    const res = await request(app).get("/api/products?limit=9999");
    assert.equal(res.status, 400);
  });
});

describe("GET /api/products/:id", () => {
  it("returns 404 for unknown id", async () => {
    const res = await request(app).get(
      "/api/products/000000000000000000000000"
    );
    assert.equal(res.status, 404);
  });

  it("rejects malformed id", async () => {
    const res = await request(app).get("/api/products/not-an-id");
    assert.equal(res.status, 404);
  });
});

describe("GET /api/products/categories", () => {
  it("returns distinct categories", async () => {
    const res = await request(app).get("/api/products/categories");
    assert.equal(res.status, 200);
    assert.ok(res.body.includes("clothing"));
    assert.ok(res.body.includes("home"));
  });
});
