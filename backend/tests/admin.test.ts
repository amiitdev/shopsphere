import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { unlinkSync } from "node:fs";
import request from "supertest";
import mongoose from "mongoose";
import { createApp } from "../src/app";
import { ProductModel } from "../src/models/Product";
import { CartModel } from "../src/models/Cart";
import { OrderModel } from "../src/models/Order";
import { UserModel } from "../src/models/User";
import { config } from "../src/config";

const app = createApp();
let adminCookie: string;
let userCookie: string;
let orderId: string;

const validCard = { number: "4242424242424242", name: "Test", expiry: "12/28", cvv: "123" };
const customer = { name: "T", email: "t@example.com", address: "1 St", city: "C", zip: "1" };

async function signupAgent(email: string) {
  const res = await request(app)
    .post("/api/auth/signup")
    .send({ name: "User", email, password: "secret1" });
  return res.headers["set-cookie"];
}

async function makeOrder() {
  const cs = await request(app).post("/api/cart");
  const cartId = cs.body.cartId;
  const pid = String((await ProductModel.findOne({ sourceId: 9201 }).exec())!._id);
  await request(app).post(`/api/cart/${cartId}/items`).send({ productId: pid, quantity: 1 });
  const os = await request(app).post("/api/orders").send({
    cartId,
    customer,
    card: validCard,
  });
  return os.body;
}

function pickCookie(setCookie: any): string {
  const arr = Array.isArray(setCookie) ? setCookie : [];
  const token = arr.find((c: string) => c.startsWith("ss_token="));
  return token ? token.split(";")[0] : "";
}

before(async () => {
  await mongoose.connect(config.testMongoUri);
  await ProductModel.deleteMany({});
  await CartModel.deleteMany({});
  await OrderModel.deleteMany({});
  await UserModel.deleteMany({});

  await ProductModel.create({
    sourceId: 9201,
    title: "Admin Test Product",
    price: 50,
    description: "d",
    category: "electronics",
    image: "/images/test.png",
    rating: { rate: 4, count: 2 },
  });

  const adminSet = await signupAgent("admin@example.com");
  const userSet = await signupAgent("user@example.com");

  const adminDoc = await UserModel.findOne({ email: "admin@example.com" }).exec();
  await UserModel.updateOne({ _id: adminDoc!._id }, { role: "admin" });

  // Log back in to refresh the token so the JWT carries role=admin.
  const adminLogin = await request(app)
    .post("/api/auth/login")
    .send({ email: "admin@example.com", password: "secret1" });
  const userLogin = await request(app)
    .post("/api/auth/login")
    .send({ email: "user@example.com", password: "secret1" });

  adminCookie = pickCookie(adminLogin.headers["set-cookie"]);
  userCookie = pickCookie(userLogin.headers["set-cookie"]);

  orderId = (await makeOrder())._id;
});

after(async () => {
  await OrderModel.deleteMany({});
  await CartModel.deleteMany({});
  await ProductModel.deleteMany({ sourceId: 9201 });
  await UserModel.deleteMany({});
  await mongoose.disconnect();
});

describe("Admin order management", () => {
  it("blocks non-admins from listing all orders", async () => {
    const res = await request(app)
      .get("/api/orders")
      .set("cookie", userCookie);
    assert.equal(res.status, 403);
  });

  it("returns 401 for anonymous access", async () => {
    const res = await request(app).get("/api/orders");
    assert.equal(res.status, 401);
  });

  it("admin lists all orders", async () => {
    const res = await request(app)
      .get("/api/orders")
      .set("cookie", adminCookie);
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.body));
    assert.ok(res.body.length >= 1);
  });

  it("admin filters orders by status", async () => {
    const res = await request(app)
      .get("/api/orders?status=pending")
      .set("cookie", adminCookie);
    assert.equal(res.status, 200);
    assert.ok(res.body.every((o: any) => o.status === "pending"));
  });

  it("admin confirms an order", async () => {
    const res = await request(app)
      .patch(`/api/orders/${orderId}/status`)
      .set("cookie", adminCookie)
      .send({ status: "confirmed" });
    assert.equal(res.status, 200);
    assert.equal(res.body.status, "confirmed");
  });

  it("admin marks an order delivered", async () => {
    const res = await request(app)
      .patch(`/api/orders/${orderId}/status`)
      .set("cookie", adminCookie)
      .send({ status: "delivered" });
    assert.equal(res.status, 200);
    assert.equal(res.body.status, "delivered");
  });

  it("rejects invalid status transitions", async () => {
    const res = await request(app)
      .patch(`/api/orders/${orderId}/status`)
      .set("cookie", adminCookie)
      .send({ status: "shipped" });
    assert.equal(res.status, 400);
  });

  it("blocks non-admins from updating status", async () => {
    const res = await request(app)
      .patch(`/api/orders/${orderId}/status`)
      .set("cookie", userCookie)
      .send({ status: "confirmed" });
    assert.equal(res.status, 403);
  });

  it("admin updates status of an individual item", async () => {
    const orderRes = await request(app)
      .get(`/api/orders/${orderId}`)
      .set("cookie", adminCookie);
    const productId = orderRes.body.items[0].productId;

    const res = await request(app)
      .patch(`/api/orders/${orderId}/items/${productId}/status`)
      .set("cookie", adminCookie)
      .send({ status: "confirmed" });

    assert.equal(res.status, 200);
    assert.equal(res.body.items[0].status, "confirmed");
    assert.equal(res.body.status, "confirmed");
  });

  it("blocks non-admins from updating individual item status", async () => {
    const orderRes = await request(app)
      .get(`/api/orders/${orderId}`)
      .set("cookie", adminCookie);
    const productId = orderRes.body.items[0].productId;

    const res = await request(app)
      .patch(`/api/orders/${orderId}/items/${productId}/status`)
      .set("cookie", userCookie)
      .send({ status: "confirmed" });

    assert.equal(res.status, 403);
  });
});

describe("Admin product management", () => {
  const payload = {
    title: "Admin Created Product",
    price: 25.5,
    description: "Created through the admin API",
    category: "accessories",
    image: "/images/01-headphones.png",
  };

  it("blocks non-admins from creating products", async () => {
    const res = await request(app)
      .post("/api/admin/products")
      .set("cookie", userCookie)
      .send(payload);
    assert.equal(res.status, 403);
  });

  it("requires authentication", async () => {
    const res = await request(app).post("/api/admin/products").send(payload);
    assert.equal(res.status, 401);
  });

  it("admin creates, reads, updates, and deletes a product", async () => {
    const created = await request(app)
      .post("/api/admin/products")
      .set("cookie", adminCookie)
      .send(payload);
    assert.equal(created.status, 201);
    assert.equal(created.body.title, payload.title);
    assert.equal(created.body.price, 25.5);
    assert.ok(created.body.sourceId > 9201);

    const listed = await request(app).get("/api/products").query({ search: "Admin Created Product" });
    assert.equal(listed.status, 200);
    assert.ok(listed.body.items.some((p: any) => p._id === created.body._id));

    const updated = await request(app)
      .put(`/api/admin/products/${created.body._id}`)
      .set("cookie", adminCookie)
      .send({ ...payload, title: "Admin Created Product v2", price: 30 });
    assert.equal(updated.status, 200);
    assert.equal(updated.body.title, "Admin Created Product v2");
    assert.equal(updated.body.price, 30);

    const deleted = await request(app)
      .delete(`/api/admin/products/${created.body._id}`)
      .set("cookie", adminCookie);
    assert.equal(deleted.status, 200);

    const gone = await request(app).get(`/api/products/${created.body._id}`);
    assert.equal(gone.status, 404);
  });

  it("rejects invalid product payloads", async () => {
    const res = await request(app)
      .post("/api/admin/products")
      .set("cookie", adminCookie)
      .send({ title: "x", price: -5, description: "", category: "", image: "javascript:alert(1)" });
    assert.equal(res.status, 400);
  });

  it("blocks non-admins from deleting products", async () => {
    const created = await request(app)
      .post("/api/admin/products")
      .set("cookie", adminCookie)
      .send(payload);
    const res = await request(app)
      .delete(`/api/admin/products/${created.body._id}`)
      .set("cookie", userCookie);
    assert.equal(res.status, 403);
    await request(app)
      .delete(`/api/admin/products/${created.body._id}`)
      .set("cookie", adminCookie);
  });
});

describe("Admin order cancellation", () => {
  it("admin cancels a pending order", async () => {
    const order = await makeOrder();
    const res = await request(app)
      .patch(`/api/admin/orders/${order._id}/cancel`)
      .set("cookie", adminCookie);
    assert.equal(res.status, 200);
    assert.equal(res.body.status, "cancelled");
    assert.equal(res.body.items[0].status, "cancelled");
  });

  it("blocks non-admins from cancelling orders", async () => {
    const order = await makeOrder();
    const res = await request(app)
      .patch(`/api/admin/orders/${order._id}/cancel`)
      .set("cookie", userCookie);
    assert.equal(res.status, 403);
  });

  it("returns 404 for an unknown order", async () => {
    const res = await request(app)
      .patch("/api/admin/orders/000000000000000000000000/cancel")
      .set("cookie", adminCookie);
    assert.equal(res.status, 404);
  });

  it("refuses to cancel an already delivered order", async () => {
    const order = await makeOrder();
    await request(app)
      .patch(`/api/orders/${order._id}/status`)
      .set("cookie", adminCookie)
      .send({ status: "delivered" });

    const res = await request(app)
      .patch(`/api/admin/orders/${order._id}/cancel`)
      .set("cookie", adminCookie);
    assert.equal(res.status, 400);
  });
});

describe("Admin cannot purchase", () => {
  it("blocks admins from adding items to a cart", async () => {
    const cartRes = await request(app).post("/api/cart");
    const cartId = cartRes.body.cartId;
    const pid = String((await ProductModel.findOne({ sourceId: 9201 }).exec())!._id);

    const res = await request(app)
      .post(`/api/cart/${cartId}/items`)
      .set("cookie", adminCookie)
      .send({ productId: pid, quantity: 1 });
    assert.equal(res.status, 403);
  });

  it("blocks admins from placing orders", async () => {
    const cartRes = await request(app).post("/api/cart");
    const cartId = cartRes.body.cartId;
    const pid = String((await ProductModel.findOne({ sourceId: 9201 }).exec())!._id);

    await request(app)
      .post(`/api/cart/${cartId}/items`)
      .send({ productId: pid, quantity: 1 });

    const res = await request(app)
      .post("/api/orders")
      .set("cookie", adminCookie)
      .send({ cartId, customer, card: validCard });
    assert.equal(res.status, 403);
  });

  it("still allows regular users and guests to order", async () => {
    const order = await makeOrder();
    assert.ok(order._id);
  });
});

describe("Admin image upload", () => {
  it("admin uploads a product image", async () => {
    const res = await request(app)
      .post("/api/admin/images")
      .set("cookie", adminCookie)
      .attach("image", Buffer.from("fake-image-bytes"), "photo.png");
    assert.equal(res.status, 201);
    assert.match(res.body.url, /^\/uploads\/.+\.png$/);

    const local = path.join(process.cwd(), "uploads", path.basename(res.body.url));
    try {
      unlinkSync(local);
    } catch {
      // ignore cleanup failures
    }
  });

  it("blocks non-admins from uploading images", async () => {
    const res = await request(app)
      .post("/api/admin/images")
      .set("cookie", userCookie)
      .attach("image", Buffer.from("fake-image-bytes"), "photo.png");
    assert.equal(res.status, 403);
  });

  it("rejects non-image files", async () => {
    const res = await request(app)
      .post("/api/admin/images")
      .set("cookie", adminCookie)
      .attach("image", Buffer.from("not an image"), "evil.txt");
    assert.equal(res.status, 400);
  });
});
