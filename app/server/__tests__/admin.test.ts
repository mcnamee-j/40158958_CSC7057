import { describe, it, expect, beforeAll, afterAll } from "vitest";
import pool from "../src/config/db";
import request from "supertest";
import app from "../src/app";

let admin_token: string;
let jane_token: string;
let mark_token: string;

beforeAll(async () => {
  const admin = await request(app)
    .post("/api/auth/login")
    .send({ email: "admin@loop.com", password: "Password123!" });
  admin_token = admin.body.access_token;

  const jane = await request(app)
    .post("/api/auth/login")
    .send({ email: "jane@pharmacy.com", password: "Password123!" });
  jane_token = jane.body.access_token;

  const mark = await request(app)
    .post("/api/auth/login")
    .send({ email: "mark@pharmacy.com", password: "Password123!" });
  mark_token = mark.body.access_token;
});

afterAll(async () => {
  await pool.end();
});

describe("GET /api/admin/overview", () => {
  it("returns 200 with counts for admin", async () => {
    const res = await request(app)
      .get("/api/admin/overview")
      .set("Authorization", `Bearer ${admin_token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.organisations)).toBe(true);
    expect(Array.isArray(res.body.users)).toBe(true);
    expect(Array.isArray(res.body.queries)).toBe(true);
    expect(typeof res.body.organisation_links).toBe("number");
  });

  it("returns 403 for a non-admin user", async () => {
    const res = await request(app)
      .get("/api/admin/overview")
      .set("Authorization", `Bearer ${jane_token}`);
    expect(res.status).toBe(403);
  });
});
