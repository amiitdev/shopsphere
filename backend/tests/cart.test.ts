import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import mongoose from "mongoose";
import { createApp } from "../src/app";
import { ProductModel } from "../src/models/Product";
import { CartModel } from "../src/models/Cart";
import { config } from "../src/config";

const app = createApp();
let productId: string;

before(async () => {
  await mongoose.connect(config.testMongoUri);
  await ProductModel.deleteMany({});
  await CartModel.deleteMany({});
  const doc = await ProductModel.create({
    sourceId: 9101,
    title: "Test Product",
    price: 25,
    description: "A test product",
    category: "electronics",
    image: "/images/test.png",
    rating: { rate: 4.0, count: 10 },
  });
  productId = String(doc._id);
});

after(async () => {
  await CartModel.deleteMany({});
  await ProductModel.deleteMany({ sourceId: 9101 });
  await mongoose.disconnect();
});

describe("POST /api/cart", () => {
  it("creates a new empty cart", async () => {
    const res = await request(app).post("/api/cart");
    assert.equal(res.status, 200);
    assert.ok(res.body.cartId);
    assert.deepEqual(res.body.items, []);
  });
});

describe("Cart flow", () => {
  let cartId: string;

  it("creates cart", async () => {
    const res = await request(app).post("/api/cart");
    assert.equal(res.status, 200);
    cartId = res.body.cartId;
  });

  it("adds an item", async () => {
    const res = await request(app)
      .post(`/api/cart/${cartId}/items`)
      .send({ productId, quantity: 2 });
    assert.equal(res.status, 200);
    assert.equal(res.body.items.length, 1);
    assert.equal(res.body.items[0].quantity, 2);
  });

  it("updates item quantity", async () => {
    const res = await request(app)
      .patch(`/api/cart/${cartId}/items/${productId}`)
      .send({ quantity: 5 });
    assert.equal(res.status, 200);
    const item = res.body.items.find(
      (i: { productId: string }) => i.productId === productId
    );
    assert.equal(item.quantity, 5);
  });

  it("removes an item", async () => {
    const res = await request(app).delete(
      `/api/cart/${cartId}/items/${productId}`
    );
    assert.equal(res.status, 200);
    assert.equal(res.body.items.length, 0);
  });

  it("returns 404 for unknown cart", async () => {
    const res = await request(app).get("/api/cart/nonexistent");
    assert.equal(res.status, 404);
  });

  it("clears a cart", async () => {
    await request(app)
      .post(`/api/cart/${cartId}/items`)
      .send({ productId, quantity: 1 });
    const res = await request(app).delete(`/api/cart/${cartId}`);
    assert.equal(res.status, 200);
    assert.equal(res.body.items.length, 0);
  });
});
