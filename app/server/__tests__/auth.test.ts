import { describe, it, expect, afterAll } from "vitest";
import pool from "../src/config/db";
import request from "supertest";
import app from "../src/app";

afterAll(async () => {
  await pool.end();
});

//login
describe("POST /api/auth/login", () => {
  it("returns 200, access and refresh tokens - valid credentials", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "jane@pharmacy.com", password: "Password123!" });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("access_token");
    expect(res.body).toHaveProperty("refresh_token");
    expect(res.body.user.role).toBe("pharmacy_staff");
  });

  it("returns 401 error with wrong password", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "jane@pharmacy.com", password: "wrong_pass" });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Invalid credentials");
  });

  it("returns 401 error with email not used by system", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "random@email.com", password: "Password123!" });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Invalid credentials");
  });

  it("returns 400 when email is missing", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ password: "Password123!" });

    expect(res.status).toBe(400);
  });

  it("returns 400 when password is missing", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "jane@pharmacy.com" });

    expect(res.status).toBe(400);
  });

  it("returns 400 when body is completely empty", async () => {
    const res = await request(app).post("/api/auth/login").send({});

    expect(res.status).toBe(400);
  });
});

//logout
describe("POST /api/auth/logout", () => {});

//refresh
describe("POST /api/auth/refresh", () => {});

//forgot pass
describe("POST /api/auth/fogot_password", () => {});

//reset pass
describe("POST /api/auth/reset_password", () => {});
