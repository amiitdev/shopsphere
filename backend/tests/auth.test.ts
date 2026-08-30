import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import mongoose from "mongoose";
import { createApp } from "../src/app";
import { UserModel } from "../src/models/User";
import { config } from "../src/config";

const app = createApp();

before(async () => {
  await mongoose.connect(config.testMongoUri);
  await UserModel.deleteMany({});
});

after(async () => {
  await UserModel.deleteMany({});
  await mongoose.disconnect();
});

describe("POST /api/auth/signup", () => {
  it("creates a new user and sets cookie", async () => {
    const res = await request(app)
      .post("/api/auth/signup")
      .send({ name: "Alice", email: "alice@test.com", password: "secret123" });
    assert.equal(res.status, 201);
    assert.ok(res.body.user);
    assert.equal(res.body.user.name, "Alice");
    assert.equal(res.body.user.email, "alice@test.com");
    assert.ok(res.headers["set-cookie"]);
  });

  it("rejects duplicate email", async () => {
    const res = await request(app)
      .post("/api/auth/signup")
      .send({ name: "Alice2", email: "alice@test.com", password: "secret123" });
    assert.equal(res.status, 409);
  });

  it("rejects short password", async () => {
    const res = await request(app)
      .post("/api/auth/signup")
      .send({ name: "Bob", email: "bob@test.com", password: "123" });
    assert.equal(res.status, 400);
  });
});

describe("POST /api/auth/login", () => {
  it("logs in with correct credentials", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "alice@test.com", password: "secret123" });
    assert.equal(res.status, 200);
    assert.ok(res.body.user);
    assert.equal(res.body.user.email, "alice@test.com");
    assert.ok(res.headers["set-cookie"]);
  });

  it("rejects wrong password", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "alice@test.com", password: "wrong" });
    assert.equal(res.status, 401);
  });
});

describe("GET /api/auth/me", () => {
  it("returns current user when authenticated", async () => {
    const agent = request.agent(app);
    await agent
      .post("/api/auth/login")
      .send({ email: "alice@test.com", password: "secret123" });
    const res = await agent.get("/api/auth/me");
    assert.equal(res.status, 200);
    assert.equal(res.body.user.email, "alice@test.com");
  });

  it("returns 401 when not authenticated", async () => {
    const res = await request(app).get("/api/auth/me");
    assert.equal(res.status, 401);
  });
});

describe("POST /api/auth/logout", () => {
  it("clears the auth cookie", async () => {
    const agent = request.agent(app);
    await agent
      .post("/api/auth/login")
      .send({ email: "alice@test.com", password: "secret123" });
    const res = await agent.post("/api/auth/logout");
    assert.equal(res.status, 200);
    const cookies = res.headers["set-cookie"] as string[] | undefined;
    assert.ok(cookies);
    const ssCookie = cookies.find((c) => c.startsWith("ss_token="));
    assert.ok(ssCookie);
    assert.ok(ssCookie.includes("Max-Age=0") || ssCookie.includes("Expires="));
  });
});
