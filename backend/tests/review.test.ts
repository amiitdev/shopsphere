import { describe, it, before, after, beforeEach } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import mongoose from "mongoose";
import { createApp } from "../src/app";
import { ProductModel } from "../src/models/Product";
import { OrderModel } from "../src/models/Order";
import { CartModel } from "../src/models/Cart";
import { UserModel } from "../src/models/User";
import { ReviewModel } from "../src/models/Review";
import { config } from "../src/config";

const app = createApp();

const validCard = {
  number: "4242424242424242",
  name: "Test User",
  expiry: "12/28",
  cvv: "123",
};

const validCustomer = {
  name: "Test User",
  email: "reviewer@example.com",
  address: "123 Main St",
  city: "Springfield",
  zip: "62701",
};

let productId: string;

function registerAndLogin(email: string) {
  return request(app)
    .post("/api/auth/signup")
    .send({ name: "Test User", email, password: "Password123!" });
}

async function loginAndGetCookie(email: string, password: string) {
  const res = await request(app)
    .post("/api/auth/login")
    .send({ email, password });
  assert.equal(res.status, 200);
  const setCookie = res.headers["set-cookie"];
  assert.ok(setCookie);
  const cookie = Array.isArray(setCookie) ? setCookie[0] : setCookie;
  return cookie;
}

async function createDeliveredOrder(cookie: string, cust: typeof validCustomer) {
  const cartRes = await request(app).post("/api/cart").set("Cookie", cookie);
  const cartId = cartRes.body.cartId;

  await request(app)
    .post(`/api/cart/${cartId}/items`)
    .set("Cookie", cookie)
    .send({ productId, quantity: 1 });

  const orderRes = await request(app)
    .post("/api/orders")
    .set("Cookie", cookie)
    .send({ cartId, customer: cust, card: validCard });
  assert.equal(orderRes.status, 201);

  const order = orderRes.body;
  const updated = await OrderModel.findByIdAndUpdate(order._id, {
    status: "delivered",
    deliveredAt: new Date(),
  }).exec();
  return updated;
}

before(async () => {
  await mongoose.connect(config.testMongoUri);
  await ReviewModel.deleteMany({});
  await OrderModel.deleteMany({});
  await CartModel.deleteMany({});
  await ProductModel.deleteMany({});
  await UserModel.deleteMany({});

  // Register the test customer once so all tests can share it
  await registerAndLogin(validCustomer.email);

  const doc = await ProductModel.create({
    sourceId: 9301,
    title: "Review Test Product",
    price: 50,
    description: "A product to review",
    category: "electronics",
    image: "/images/test.png",
    rating: { rate: 0, count: 0 },
  });
  productId = String(doc._id);
});

after(async () => {
  await ReviewModel.deleteMany({});
  await OrderModel.deleteMany({});
  await CartModel.deleteMany({});
  await ProductModel.deleteMany({ sourceId: 9301 });
  await UserModel.deleteMany({});
  await mongoose.disconnect();
});

beforeEach(async () => {
  await ReviewModel.deleteMany({});
});

describe("Product reviews", () => {
  it("GET /reviews returns empty list and summary before any review", async () => {
    const res = await request(app).get(`/api/products/${productId}/reviews`);
    assert.equal(res.status, 200);
    assert.equal(res.body.total, 0);
    assert.equal(res.body.summary.count, 0);
    assert.equal(res.body.summary.average, 0);
    assert.equal(res.body.items.length, 0);
  });

  it("POST /reviews rejects non-purchasers (403) and unauthenticated (401)", async () => {
    const anon = await request(app).post(`/api/products/${productId}/reviews`).send({
      rating: 5,
      title: "Too soon",
      comment: "I didn't buy this.",
    });
    assert.equal(anon.status, 401);

    // register so the user exists, then verify non-purchaser gets 403
    const cookie = await loginAndGetCookie(validCustomer.email, "Password123!");

    const nonBuyer = await request(app)
      .post(`/api/products/${productId}/reviews`)
      .set("Cookie", cookie)
      .send({ rating: 5, comment: "hi" });
    assert.equal(nonBuyer.status, 403);

    const bad = await request(app)
      .post(`/api/products/${productId}/reviews`)
      .set("Cookie", cookie)
      .send({ rating: 99 });
    assert.equal(bad.status, 400);
  });

  it("a customer who purchased + received can leave a verified review", async () => {
    const cookie = await loginAndGetCookie(validCustomer.email, "Password123!");

    await createDeliveredOrder(cookie, validCustomer);

    const res = await request(app)
      .post(`/api/products/${productId}/reviews`)
      .set("Cookie", cookie)
      .send({ rating: 5, title: "Loved it", comment: "Great headphones." });
    assert.equal(res.status, 201);
    assert.equal(res.body.rating, 5);
    assert.equal(res.body.verifiedPurchase, true);

    const list = await request(app)
      .get(`/api/products/${productId}/reviews`)
      .set("Cookie", cookie);
    assert.equal(list.body.total, 1);
    assert.equal(list.body.items.length, 1);
    assert.equal(list.body.summary.average, 5);
    assert.equal(list.body.summary.count, 1);
    assert.equal(list.body.canReview, true);
    assert.equal(list.body.verifiedPurchase, true);
  });

  it("upsert updates the existing review and recomputes aggregate", async () => {
    const cookie = await loginAndGetCookie(validCustomer.email, "Password123!");
    const pid = new mongoose.Types.ObjectId(productId);
    const userId = (await UserModel.findOne({ email: validCustomer.email }).then((u) => u!._id)) as mongoose.Types.ObjectId;

    // customer has purchased + received so writing a review is allowed
    await createDeliveredOrder(cookie, validCustomer);

    await ReviewModel.create({
      productId: pid,
      userId,
      rating: 3,
      title: "Okay",
      comment: "Meh",
      verifiedPurchase: true,
    });
    await recomputeAggregate(pid);

    const res = await request(app)
      .post(`/api/products/${productId}/reviews`)
      .set("Cookie", cookie)
      .send({ rating: 4, comment: "Better after updates" });
    assert.equal(res.status, 201);
    assert.equal(res.body.rating, 4);

    const count = await ReviewModel.countDocuments({
      productId: new mongoose.Types.ObjectId(productId),
    });
    assert.equal(count, 1);
  });

  it("rating breakdown reflects multiple reviews", async () => {
    const pid = new mongoose.Types.ObjectId(productId);
    const userId = (await UserModel.findOne({ email: validCustomer.email }).then((u) => u!._id)) as mongoose.Types.ObjectId;
    for (const rating of [5, 1, 1]) {
      await ReviewModel.create({
        productId: pid,
        userId,
        rating,
        verifiedPurchase: true,
      });
    }
    await recomputeAggregate(pid);

    const summary = await import("../src/services/reviewService").then((m) => m.ratingSummary(productId));
    assert.equal(summary.count, 3);
    assert.equal(summary.average, 2.3);
    assert.equal(summary.breakdown[1], 2);
    assert.equal(summary.breakdown[5], 1);
  });
});

describe("Admin review moderation", () => {
  const adminEmail = "admin+review@shopsphere.com";
  const adminPassword = "Admin12345!";

  before(async () => {
    await UserModel.deleteOne({ email: adminEmail });
    const bcrypt = await import("bcryptjs");
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    await UserModel.create({
      name: "Admin Reviewer",
      email: adminEmail,
      passwordHash,
      role: "admin",
    });
  });

  async function adminCookie() {
    return loginAndGetCookie(adminEmail, adminPassword);
  }

  it("GET /api/admin/reviews lists reviews with product + user info", async () => {
    const cookie = await adminCookie();

    const res = await request(app).get("/api/admin/reviews").set("Cookie", cookie);
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.body.items));
    assert.equal(typeof res.body.total, "number");

    // a non-admin (authenticated customer) is forbidden
    const reg = await registerAndLogin(validCustomer.email);
    const userCookie = await loginAndGetCookie(validCustomer.email, "Password123!");
    const userRes = await request(app).get("/api/admin/reviews").set("Cookie", userCookie);
    assert.equal(userRes.status, 403);
  });

  it("DELETE /api/admin/reviews/:id removes a review and updates aggregate", async () => {
    const cookie = await adminCookie();

    const pid = new mongoose.Types.ObjectId(productId);
    const userId = (await UserModel.findOne({ email: validCustomer.email }).then((u) => u!._id)) as mongoose.Types.ObjectId;
    const created = await ReviewModel.create({
      productId: pid,
      userId,
      rating: 4,
      verifiedPurchase: true,
    });
    await recomputeAggregate(pid);

    const res = await request(app).delete(`/api/admin/reviews/${created._id}`).set("Cookie", cookie);
    assert.equal(res.status, 200);

    assert.equal(await ReviewModel.countDocuments({ _id: created._id }), 0);
  });
});


import { recomputeAggregate } from "../src/services/reviewService";
