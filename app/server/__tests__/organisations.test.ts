import { describe, it, expect, beforeAll, afterAll } from "vitest";
import pool from "../src/config/db";
import request from "supertest";
import app from "../src/app";

let jane_token: string;
let sarah_token: string;
let admin_token: string;

beforeAll(async () => {
  const jane = await request(app)
    .post("/api/auth/login")
    .send({ email: "jane@pharmacy.com", password: "Password123!" });
  jane_token = jane.body.access_token;

  const sarah = await request(app)
    .post("/api/auth/login")
    .send({ email: "sarah@surgery.com", password: "Password123!" });
  sarah_token = sarah.body.access_token;

  const admin = await request(app)
    .post("/api/auth/login")
    .send({ email: "admin@loop.com", password: "Password123!" });
  admin_token = admin.body.access_token;
});

afterAll(async () => {
  await pool.end();
});

describe("GET /api/organisations/linked", () => {
  it("returns 200 and the linked GP surgery for a pharmacy user", async () => {
    const res = await request(app)
      .get("/api/organisations/linked")
      .set("Authorization", `Bearer ${jane_token}`);

    expect(res.status).toBe(200);
    expect(res.body.organisations).toHaveLength(1);
    expect(res.body.organisations[0].name).toBe("Hillview Surgery");
    expect(res.body.organisations[0].type).toBe("gp_surgery");
  });

  it("returns 200 and the linked pharmacy for a GP surgery user", async () => {
    const res = await request(app)
      .get("/api/organisations/linked")
      .set("Authorization", `Bearer ${sarah_token}`);

    expect(res.status).toBe(200);
    expect(res.body.organisations).toHaveLength(1);
    expect(res.body.organisations[0].name).toBe("City Pharmacy Belfast");
    expect(res.body.organisations[0].type).toBe("pharmacy");
  });

  it("returns 401 when no token is provided", async () => {
    const res = await request(app).get("/api/organisations/linked");
    expect(res.status).toBe(401);
  });

  it("returns an empty array for an organisation with no links", async () => {
    const aoife = await request(app)
      .post("/api/auth/login")
      .send({ email: "aoife@riverside.com", password: "Password123!" });

    const res = await request(app)
      .get("/api/organisations/linked")
      .set("Authorization", `Bearer ${aoife.body.access_token}`);

    expect(res.status).toBe(200);
    expect(res.body.organisations).toEqual([]);
  });
});

describe("GET /api/organisations/staff", () => {
  it("returns 200 and active colleagues, excluding self", async () => {
    const res = await request(app)
      .get("/api/organisations/staff")
      .set("Authorization", `Bearer ${jane_token}`);

    expect(res.status).toBe(200);
    expect(res.body.staff.some((s: any) => s.first_name === "Mark")).toBe(true);
    expect(res.body.staff.some((s: any) => s.first_name === "Jane")).toBe(
      false,
    );
  });

  it("returns 401 when no token is provided", async () => {
    const res = await request(app).get("/api/organisations/staff");
    expect(res.status).toBe(401);
  });
});
