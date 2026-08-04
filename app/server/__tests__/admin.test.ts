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

describe("POST /api/admin/organisations", () => {
  it("returns 201 for a valid org", async () => {
    const res = await request(app)
      .post("/api/admin/organisations")
      .set("Authorization", `Bearer ${admin_token}`)
      .send({ name: "Test Surgery", type: "gp_surgery" });
    expect(res.status).toBe(201);
  });

  it("returns 400 for an invalid type", async () => {
    const res = await request(app)
      .post("/api/admin/organisations")
      .set("Authorization", `Bearer ${admin_token}`)
      .send({ name: "Bad Org", type: "system" });
    expect(res.status).toBe(400);
  });

  it("returns 403 for a non-admin", async () => {
    const res = await request(app)
      .post("/api/admin/organisations")
      .set("Authorization", `Bearer ${jane_token}`)
      .send({ name: "Test", type: "pharmacy" });
    expect(res.status).toBe(403);
  });
});

describe("POST /api/admin/organisation-links", () => {
  it("returns 409 when the link already exists", async () => {
    const res = await request(app)
      .post("/api/admin/organisation-links")
      .set("Authorization", `Bearer ${admin_token}`)
      .send({ pharmacy_id: 1, gp_surgery_id: 2 }); //linked in seed data already
    expect(res.status).toBe(409);
  });

  it("returns 400 when pharmacy_id is not actually a pharmacy", async () => {
    const res = await request(app)
      .post("/api/admin/organisation-links")
      .set("Authorization", `Bearer ${admin_token}`)
      .send({ pharmacy_id: 2, gp_surgery_id: 1 }); // swapped ids - 2 is the GP surgery
    expect(res.status).toBe(400);
  });
});
