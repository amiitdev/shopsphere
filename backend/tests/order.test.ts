import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import mongoose from "mongoose";
import { createApp } from "../src/app";
import { ProductModel } from "../src/models/Product";
import { CartModel } from "../src/models/Cart";
import { OrderModel } from "../src/models/Order";
import { UserModel } from "../src/models/User";
import { config } from "../src/config";

const app = createApp();
let productId: string;

const validCard = {
  number: "4242424242424242",
  name: "Test User",
  expiry: "12/28",
  cvv: "123",
};

const validCustomer = {
  name: "Test User",
  email: "test@example.com",
  address: "123 Main St",
  city: "Springfield",
  zip: "62701",
};

before(async () => {
  await mongoose.connect(config.testMongoUri);
  await ProductModel.deleteMany({});
  await CartModel.deleteMany({});
  await OrderModel.deleteMany({});
  await UserModel.deleteMany({});

  const doc = await ProductModel.create({
    sourceId: 9201,
    title: "Test Product",
    price: 50,
    description: "A test product",
    category: "electronics",
    image: "/images/test.png",
    rating: { rate: 4.0, count: 10 },
  });
  productId = String(doc._id);
});

after(async () => {
  await OrderModel.deleteMany({});
  await CartModel.deleteMany({});
  await ProductModel.deleteMany({ sourceId: 9201 });
  await UserModel.deleteMany({});
  await mongoose.disconnect();
});

describe("POST /api/orders", () => {
  it("checkout succeeds with valid cart", async () => {
    const cartRes = await request(app).post("/api/cart");
    const cartId = cartRes.body.cartId;

    await request(app)
      .post(`/api/cart/${cartId}/items`)
      .send({ productId, quantity: 2 });

    const res = await request(app)
      .post("/api/orders")
      .send({ cartId, customer: validCustomer, card: validCard });
    assert.equal(res.status, 201);
    assert.ok(res.body.orderNumber);
    assert.equal(res.body.status, "pending");
    assert.equal(res.body.items.length, 1);
    assert.equal(res.body.subtotal, 100);
    assert.ok(res.body.payment.transactionId);
  });

  it("returns 400 for empty cart", async () => {
    const cartRes = await request(app).post("/api/cart");
    const cartId = cartRes.body.cartId;

    const res = await request(app)
      .post("/api/orders")
      .send({ cartId, customer: validCustomer, card: validCard });
    assert.equal(res.status, 400);
  });
});

describe("GET /api/orders/:id", () => {
  it("returns 404 for unknown order", async () => {
    const res = await request(app).get(
      "/api/orders/000000000000000000000000"
    );
    assert.equal(res.status, 404);
  });
});

describe("GET /api/orders/me", () => {
  it("requires authentication", async () => {
    const res = await request(app).get("/api/orders/me");
    assert.equal(res.status, 401);
  });
});
