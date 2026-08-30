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
      sourceId: 9901,
      title: "Wireless Bluetooth Headphones",
      price: 79.99,
      description: "Noise-cancelling wireless headphones with 20hr battery",
      category: "electronics",
      image: "/images/headphones.png",
      rating: { rate: 4.5, count: 120 },
    },
    {
      sourceId: 9902,
      title: "Organic Green Tea Set",
      price: 34.99,
      description: "Premium Japanese green tea with ceramic teapot",
      category: "home",
      image: "/images/tea.png",
      rating: { rate: 4.8, count: 89 },
    },
  ]);
});

after(async () => {
  await ProductModel.deleteMany({ sourceId: { $gte: 9900 } });
  await mongoose.disconnect();
});

describe("AI endpoints", () => {
  it("POST /api/ai/chat responds with a reply", async () => {
    if (!config.openrouterApiKey) return; // skip if no API key
    const res = await request(app)
      .post("/api/ai/chat")
      .send({ message: "What headphones do you have?" });
    assert.equal(res.status, 200);
    assert.ok(typeof res.body.reply === "string");
    assert.ok(res.body.reply.length > 0);
    assert.ok(Array.isArray(res.body.productIds));
  });

  it("POST /api/ai/search returns ranked results", async () => {
    if (!config.openrouterApiKey) return;
    const res = await request(app)
      .post("/api/ai/search")
      .send({ query: "wireless headphones under 100" });
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.body.results));
  });

  it("POST /api/ai/sentiment returns sentiment", async () => {
    if (!config.openrouterApiKey) return;
    const res = await request(app)
      .post("/api/ai/sentiment")
      .send({ text: "This product is amazing! Best purchase ever." });
    assert.equal(res.status, 200);
    assert.ok(["positive", "negative", "neutral"].includes(res.body.sentiment));
    assert.ok(typeof res.body.confidence === "number");
    assert.ok(Array.isArray(res.body.themes));
  });

  it("GET /api/ai/recommendations/:id returns recommendations", async () => {
    if (!config.openrouterApiKey) return;
    const product = await ProductModel.findOne({ sourceId: 9901 }).lean();
    const res = await request(app).get(
      `/api/ai/recommendations/${String(product?._id)}`
    );
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.body.recommendations));
  });

  it("POST /api/ai/chat rejects empty message", async () => {
    const res = await request(app).post("/api/ai/chat").send({ message: "" });
    assert.equal(res.status, 400);
  });

  it("POST /api/ai/search rejects short query", async () => {
    const res = await request(app).post("/api/ai/search").send({ query: "a" });
    assert.equal(res.status, 400);
  });
});
