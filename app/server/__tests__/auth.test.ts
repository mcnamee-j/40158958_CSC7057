import { describe, it, expect, afterAll, beforeAll } from "vitest";
import pool from "../src/config/db";
import request from "supertest";
import app from "../src/app";

beforeAll(async () => {
  await pool.query(
    `TRUNCATE refresh_tokens, password_reset_tokens, audit_log
     RESTART IDENTITY CASCADE`,
  );
});

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

//middleware
describe("middleware tests", () => {
  it("rejects request with no Authorization header", async () => {
    const res = await request(app)
      .post("/api/auth/logout")
      .send({ refresh_token: "token" });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe("No token provided");
  });

  it("rejects request with incorrect Authorization header", async () => {
    const res = await request(app)
      .post("/api/auth/logout")
      .set("Authorization", "incorrect_layout")
      .send({ refresh_token: "token" });

    expect(res.status).toBe(401);
  });

  it("rejects request with invalid token", async () => {
    const res = await request(app)
      .post("/api/auth/logout")
      .set("Authorization", "Bearer invalid_token")
      .send({ refresh_token: "token" });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Invalid token");
  });
});

//audit_log
describe("audit log entry tests", () => {
  it("creates audit log entry on successful login", async () => {
    await request(app)
      .post("/api/auth/login")
      .send({ email: "sarah@surgery.com", password: "Password123!" });

    const result = await pool.query(
      `SELECT * 
        FROM audit_log
        WHERE action = 'user_login'
        ORDER BY performed_at DESC
        LIMIT 1`,
    );

    expect(result.rows.length).toBeGreaterThan(0);
    expect(result.rows[0].action).toBe("user_login");
  });

  it("creates audit log entry on failed login", async () => {
    await request(app)
      .post("/api/auth/login")
      .send({ email: "sarah@surgery.com", password: "wrong_password" });

    const result = await pool.query(
      `SELECT * 
        FROM audit_log
        WHERE action = 'failed_login'
        ORDER BY performed_at DESC
        LIMIT 1`,
    );

    expect(result.rows.length).toBeGreaterThan(0);
    expect(result.rows[0].action).toBe("failed_login");
  });
});

//new get_user endpoint
describe("GET /api/auth/get_user", () => {
  it("returns 200 and user details for a valid token", async () => {
    const login = await request(app)
      .post("/api/auth/login")
      .send({ email: "jane@pharmacy.com", password: "Password123!" });

    const res = await request(app)
      .get("/api/auth/get_user")
      .set("Authorization", `Bearer ${login.body.access_token}`);

    expect(res.status).toBe(200);
    expect(res.body.user.email ?? res.body.user.role).toBeDefined();
    expect(res.body.user.organisation_name).toBe("City Pharmacy Belfast");
  });

  it("returns 401 when no token is provided", async () => {
    const res = await request(app).get("/api/auth/get_user");
    expect(res.status).toBe(401);
  });
});

describe("PATCH /api/auth/update", () => {
  it("updates the user's own name and email", async () => {
    const login = await request(app)
      .post("/api/auth/login")
      .send({ email: "jane@pharmacy.com", password: "Password123!" });

    const res = await request(app)
      .patch("/api/auth/update")
      .set("Authorization", `Bearer ${login.body.access_token}`)
      .send({
        first_name: "Janet",
        last_name: "Smith",
        email: "jane@pharmacy.com",
      });

    expect(res.status).toBe(200);
    expect(res.body.user.first_name).toBe("Janet");

    // revert for other tests
    await request(app)
      .patch("/api/auth/update")
      .set("Authorization", `Bearer ${login.body.access_token}`)
      .send({
        first_name: "Jane",
        last_name: "Smith",
        email: "jane@pharmacy.com",
      });
  });

  it("returns 409 when email is already taken by another user", async () => {
    const login = await request(app)
      .post("/api/auth/login")
      .send({ email: "jane@pharmacy.com", password: "Password123!" });

    const res = await request(app)
      .patch("/api/auth/update")
      .set("Authorization", `Bearer ${login.body.access_token}`)
      .send({
        first_name: "Jane",
        last_name: "Smith",
        email: "mark@pharmacy.com",
      });

    expect(res.status).toBe(409);
  });

  it("returns 401 with no token", async () => {
    const res = await request(app).patch("/api/auth/update").send({
      first_name: "Jane",
      last_name: "Smith",
      email: "jane@pharmacy.com",
    });

    expect(res.status).toBe(401);
  });
});
