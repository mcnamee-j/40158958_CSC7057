import { describe, it, expect, beforeAll, afterAll } from "vitest";
import pool from "../src/config/db";
import request from "supertest";
import app from "../src/app";

let mark_token: string;
let jane_token: string;

beforeAll(async () => {
  const mark = await request(app)
    .post("/api/auth/login")
    .send({ email: "mark@pharmacy.com", password: "Password123!" });
  mark_token = mark.body.access_token;

  const jane = await request(app)
    .post("/api/auth/login")
    .send({ email: "jane@pharmacy.com", password: "Password123!" });
  jane_token = jane.body.access_token;
});

afterAll(async () => {
  await pool.end();
});

describe("GET /api/reports/resolution-stats", () => {
  it("returns 200 with stats for a manager", async () => {
    const res = await request(app)
      .get("/api/reports/resolution-stats")
      .set("Authorization", `Bearer ${mark_token}`);

    expect(res.status).toBe(200);
    expect(typeof res.body.total_queries).toBe("number");
    expect(typeof res.body.percentage_resolved).toBe("number");
  });

  it("returns 403 for a non-manager", async () => {
    const res = await request(app)
      .get("/api/reports/resolution-stats")
      .set("Authorization", `Bearer ${jane_token}`);
    expect(res.status).toBe(403);
  });
});
