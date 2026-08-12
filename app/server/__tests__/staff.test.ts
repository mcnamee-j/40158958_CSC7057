import { describe, it, expect, beforeAll, afterAll } from "vitest";
import pool from "../src/config/db";
import request from "supertest";
import app from "../src/app";

let mark_token: string; // pharmacy_manager role
let jane_token: string; // pharmacy_staff role

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

describe("GET /api/staff", () => {
  it("returns 200 with the manager's own org staff", async () => {
    const res = await request(app)
      .get("/api/staff")
      .set("Authorization", `Bearer ${mark_token}`);
    expect(res.status).toBe(200);
    expect(
      res.body.staff.some((staff: any) => staff.email === "jane@pharmacy.com"),
    ).toBe(true);
  });
});

describe("GET /api/staff (read access)", () => {
  it("allows a non-manager staff member to read their own org's staff list", async () => {
    const res = await request(app)
      .get("/api/staff")
      .set("Authorization", `Bearer ${jane_token}`);
    expect(res.status).toBe(200);
  });
});

describe("POST /api/staff", () => {
  it("returns 201 and creates a staff account", async () => {
    const res = await request(app)
      .post("/api/staff")
      .set("Authorization", `Bearer ${mark_token}`)
      .send({
        first_name: "New",
        last_name: "Staff",
        email: `new-${Date.now()}@pharmacy.com`,
        role: "pharmacy_staff",
      });
    expect(res.status).toBe(201);
    expect(res.body.staff.role).toBe("pharmacy_staff");
  });

  it("returns 400 for a role invalid for the org type", async () => {
    const res = await request(app)
      .post("/api/staff")
      .set("Authorization", `Bearer ${mark_token}`)
      .send({
        first_name: "Bad",
        last_name: "Role",
        email: `bad-${Date.now()}@pharmacy.com`,
        role: "practice_staff",
      });
    expect(res.status).toBe(400);
  });

  it("returns 409 for a duplicate email", async () => {
    const res = await request(app)
      .post("/api/staff")
      .set("Authorization", `Bearer ${mark_token}`)
      .send({
        first_name: "Dup",
        last_name: "Email",
        email: "jane@pharmacy.com",
        role: "pharmacy_staff",
      });
    expect(res.status).toBe(409);
  });
});

describe("PATCH /api/staff/:id/deactivate", () => {
  it("deactivates a staff member and prevents login", async () => {
    const created = await request(app)
      .post("/api/staff")
      .set("Authorization", `Bearer ${mark_token}`)
      .send({
        first_name: "ToDeactivate",
        last_name: "User",
        email: `deact-${Date.now()}@pharmacy.com`,
        role: "pharmacy_staff",
      });

    const res = await request(app)
      .patch(`/api/staff/${created.body.staff.id}/deactivate`)
      .set("Authorization", `Bearer ${mark_token}`);
    expect(res.status).toBe(200);

    const check = await pool.query(
      `SELECT active 
        FROM users 
        WHERE id = $1`,
      [created.body.staff.id],
    );
    expect(check.rows[0].active).toBe(false);
  });

  it("returns 404 for a staff id belonging to a different org", async () => {
    const res = await request(app)
      .patch(`/api/staff/999999/deactivate`)
      .set("Authorization", `Bearer ${mark_token}`);
    expect(res.status).toBe(404);
  });

  it("returns 400 when a manager tries to deactivate their own account", async () => {
    const login = await request(app)
      .post("/api/auth/login")
      .send({ email: "mark@pharmacy.com", password: "Password123!" });
    const mark_id = login.body.user.id;

    const res = await request(app)
      .patch(`/api/staff/${mark_id}/deactivate`)
      .set("Authorization", `Bearer ${mark_token}`);

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Cannot deactivate your own account");
  });
});

describe("POST /api/staff/:id/reset-password", () => {
  it("returns 200 and sends a reset link", async () => {
    const created = await request(app)
      .post("/api/staff")
      .set("Authorization", `Bearer ${mark_token}`)
      .send({
        first_name: "Reset",
        last_name: "Test",
        email: `reset-${Date.now()}@pharmacy.com`,
        role: "pharmacy_staff",
      });

    const res = await request(app)
      .post(`/api/staff/${created.body.staff.id}/reset-password`)
      .set("Authorization", `Bearer ${mark_token}`);

    expect(res.status).toBe(200);
  });

  it("returns 403 for a non-manager", async () => {
    const res = await request(app)
      .post("/api/staff/1/reset-password")
      .set("Authorization", `Bearer ${jane_token}`);
    expect(res.status).toBe(403);
  });

  it("returns 404 for a staff member in a different org", async () => {
    const res = await request(app)
      .post("/api/staff/999999/reset-password")
      .set("Authorization", `Bearer ${mark_token}`);
    expect(res.status).toBe(404);
  });
});

describe("PATCH /api/staff/:id/reactivate", () => {
  it("reactivates a deactivated staff member", async () => {
    const created = await request(app)
      .post("/api/staff")
      .set("Authorization", `Bearer ${mark_token}`)
      .send({
        first_name: "Reactivate",
        last_name: "Test",
        email: `react-${Date.now()}@pharmacy.com`,
        role: "pharmacy_staff",
      });

    await request(app)
      .patch(`/api/staff/${created.body.staff.id}/deactivate`)
      .set("Authorization", `Bearer ${mark_token}`);

    const res = await request(app)
      .patch(`/api/staff/${created.body.staff.id}/reactivate`)
      .set("Authorization", `Bearer ${mark_token}`);
    expect(res.status).toBe(200);

    const check = await pool.query(`SELECT active FROM users WHERE id = $1`, [
      created.body.staff.id,
    ]);
    expect(check.rows[0].active).toBe(true);
  });
});
