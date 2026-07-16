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
describe("POST /api/auth/logout", () => {
  it("returns 401 when no token is provided", async () => {
    const res = await request(app)
      .post("/api/auth/logout")
      .send({ refresh_token: "fake_token" });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe("No token provided");
  });

  it("returns 200 when logout is successful", async () => {
    const login = await request(app)
      .post("/api/auth/login")
      .send({ email: "jane@pharmacy.com", password: "Password123!" });

    const { access_token, refresh_token } = login.body;

    const res = await request(app)
      .post("/api/auth/logout")
      .set("Authorization", `Bearer ${access_token}`)
      .send({ refresh_token });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Logged out successfully");
  });

  it("returns 400 with a missing refresh token", async () => {
    const login = await request(app)
      .post("/api/auth/login")
      .send({ email: "mark@pharmacy.com", password: "Password123!" });

    const { access_token } = login.body;

    const res = await request(app)
      .post("/api/auth/logout")
      .set("Authorization", `Bearer ${access_token}`)
      .send({});

    expect(res.status).toBe(400);
  });
});

//refresh
describe("POST /api/auth/refresh", () => {
  it("returns 200 and a new access token for a valid refresh token", async () => {
    const login = await request(app)
      .post("/api/auth/login")
      .send({ email: "mark@pharmacy.com", password: "Password123!" });

    const { refresh_token } = login.body;

    const res = await request(app)
      .post("/api/auth/refresh")
      .send({ refresh_token });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("access_token");
  });

  it("returns 401 for invalid refresh token", async () => {
    const res = await request(app)
      .post("/api/auth/refresh")
      .send({ refresh_token: "fake_token" });

    expect(res.status).toBe(401);
  });

  it("returns 400 when refresh token is missing", async () => {
    const res = await request(app).post("/api/auth/refresh").send({});

    expect(res.status).toBe(400);
  });
});

//forgot pass
describe("POST /api/auth/forgot_password", () => {
  it("returns 200 for an email registered in the system", async () => {
    const res = await request(app)
      .post("/api/auth/forgot_password")
      .send({ email: "jane@pharmacy.com" });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("message");
  });

  it("returns 200 for unregistered email also", async () => {
    const res = await request(app)
      .post("/api/auth/forgot_password")
      .send({ email: "nobody@unknown.com" });

    expect(res.status).toBe(200);
  });

  it("returns 400 when email is missing", async () => {
    const res = await request(app).post("/api/auth/forgot_password").send({});

    expect(res.status).toBe(400);
  });
});

//reset pass
describe("POST /api/auth/reset_password", () => {
  it("returns 400 for invalid/expired token", async () => {
    const res = await request(app)
      .post("/api/auth/reset_password")
      .send({ token: "invalid_token", new_password: "NewPassword123!" });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Invalid or expired reset token");
  });

  it("returns 400 when token is absent", async () => {
    const res = await request(app)
      .post("/api/auth/reset_password")
      .send({ newPassword: "NewPassword123!" });

    expect(res.status).toBe(400);
  });

  it("returns 400 when new password is absent", async () => {
    const res = await request(app)
      .post("/api/auth/reset_password")
      .send({ token: "token" });

    expect(res.status).toBe(400);
  });
});
