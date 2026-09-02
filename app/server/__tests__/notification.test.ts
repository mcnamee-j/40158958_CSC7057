//Integration tests for notifications routes

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import pool from "../src/config/db";
import request from "supertest";
import app from "../src/app";

let jane_token: string;

beforeAll(async () => {
  const jane = await request(app)
    .post("/api/auth/login")
    .send({ email: "jane@pharmacy.com", password: "Password123!" });
  jane_token = jane.body.access_token;
});

afterAll(async () => {
  await pool.end();
});

describe("GET /api/notifications", () => {
  it("returns 200 and a list of notifications", async () => {
    const res = await request(app)
      .get("/api/notifications")
      .set("Authorization", `Bearer ${jane_token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.notifications)).toBe(true);
  });

  it("returns 401 with no token", async () => {
    const res = await request(app).get("/api/notifications");
    expect(res.status).toBe(401);
  });
});

describe("PATCH /api/notifications/:id/read", () => {
  it("returns 404 for a notification that doesn't belong to the user", async () => {
    const res = await request(app)
      .patch("/api/notifications/999999/read")
      .set("Authorization", `Bearer ${jane_token}`);

    expect(res.status).toBe(404);
  });
});

describe("PATCH /api/notifications/read-all", () => {
  it("returns 200", async () => {
    const res = await request(app)
      .patch("/api/notifications/read-all")
      .set("Authorization", `Bearer ${jane_token}`);

    expect(res.status).toBe(200);
  });
});
