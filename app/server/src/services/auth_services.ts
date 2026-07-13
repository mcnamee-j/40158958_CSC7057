import pool from "../config/db.js";
import jwt from "jsonwebtoken";
import type { User } from "../types/types.js";
import bcrypt from "bcrypt";
import crypto from "crypto";

//login
const login = async (email: string, password: string) => {
  //find user
  const userSearch = await pool.query(
    `SELECT * 
    FROM users 
    WHERE email = $1`,
    [email],
  );

  //store user
  const user: User = userSearch.rows[0];

  // invalid user
  if (!user || !user.active) {
    throw new Error("Invalid Credentials");
  }
  // check entered password vs stored password (use bcrypt.compare) then access token is created
  //valid path
  const validCredentials = await bcrypt.compare(password, user.hashed_password);
  // invalid path
  if (!validCredentials) {
    throw new Error("Invalid Credentials");
  }
  //access token on validation
  const ACCESS_SECRET = process.env.ACCESS_SECRET;
  if (!ACCESS_SECRET) {
    throw new Error("Internal Server error - ACCESS_SECRET");
  }

  const accessToken = jwt.sign(
    {
      userId: user.id,
      role: user.role,
      organisationId: user.organisation_id,
    },
    ACCESS_SECRET,
    { expiresIn: "15m" },
  );

  // expiry/refresh token - saved in db
  const refreshToken = crypto.randomUUID();

  const token_hash = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 1);

  //saves the refresh token to database
  await pool.query(
    `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
     VALUES ($1, $2, $3)`,
    [user.id, token_hash, expiresAt],
  );

  // update login time
  await pool.query(
    `UPDATE users
    SET last_login = NOW()
    WHERE id = $1`,
    [user.id],
  );

  //returns token and user info
  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role,
      organisation: user.organisation_id,
    },
  };
};

//logout
const logout = async (refreshToken: string) => {
  const token_hash = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");

  await pool.query(
    `UPDATE refresh_tokens 
    SET revoked = true 
    WHERE token_hash = $1`,
    [token_hash],
  );
};

//refresh token
const refresh = async (refreshToken: string) => {
  const token_hash = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");

  const result = await pool.query(
    `SELECT refresh_tokens.*, users.role, users.organisation_id, users.active
     FROM refresh_tokens
     JOIN users
     ON refresh_tokens.user_id = users.id
     WHERE refresh_tokens.token_hash = $1
     AND refresh_tokens.revoked = false
     AND refresh_tokens.expires_at > NOW()`,
    [token_hash],
  );

  const token = result.rows[0];

  if (!token || !token.active) {
    throw new Error("Invalid refresh token");
  }

  const accessToken = jwt.sign(
    {
      userId: token.user_id,
      role: token.role,
      organisationId: token.organisation_id,
    },
    process.env.JWT_SECRET!,
    { expiresIn: "15m" },
  );

  return { accessToken };
};

export default { login };
