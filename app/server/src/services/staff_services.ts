import pool from "../config/db.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import {
  send_invitation_email,
  send_password_reset_email,
} from "./mail_service.js";

const PHARMACY_ROLES = ["pharmacy_staff", "pharmacy_manager"];
const GP_SURGERY_ROLES = ["practice_staff", "practice_manager"];

const list_staff = async (organisation_id: number) => {
  const result = await pool.query(
    `SELECT id, first_name, last_name, email, role, active
        FROM users
        WHERE organisation_id = $1
        ORDER BY active DESC, first_name`,
    [organisation_id],
  );
  return result.rows;
};

const create_staff = async (
  organisation_id: number,
  first_name: string,
  last_name: string,
  email: string,
  role: string,
) => {
  const org = await pool.query(
    `SELECT type
        FROM organisations
        WHERE id = $1`,
    [organisation_id],
  );
  if (org.rows.length === 0) {
    throw new Error("Organisation not found");
  }

  const valid_roles =
    org.rows[0].type === "pharmacy" ? PHARMACY_ROLES : GP_SURGERY_ROLES;
  if (!valid_roles.includes(role)) {
    throw new Error("Invalid role for this organisation type");
  }

  const existing_user = await pool.query(
    `SELECT id
    FROM users
    WHERE email = $1`,
    [email],
  );
  if (existing_user.rows.length > 0) {
    throw new Error("Email already in use");
  }

  //set password for new user to a random string
  const random_password = crypto.randomUUID() + crypto.randomUUID();
  const hashed_password = await bcrypt.hash(random_password, 10);

  const new_user = await pool.query(
    `INSERT INTO users
    (organisation_id, first_name, last_name, email, hashed_password, role, active)
    VALUES ($1, $2, $3, $4, $5, $6, true)
    RETURNING id, first_name, last_name, email, role, active`,
    [organisation_id, first_name, last_name, email, hashed_password, role],
  );

  const invite_token = crypto.randomUUID();
  const token_hash = crypto
    .createHash("sha256")
    .update(invite_token)
    .digest("hex");
  const expires_at = new Date();
  expires_at.setHours(expires_at.getHours() + 48);

  await pool.query(
    `INSERT INTO password_reset_tokens
    (user_id, token_hash, expires_at)
    VALUES ($1, $2, $3)`,
    [new_user.rows[0].id, token_hash, expires_at],
  );

  await send_invitation_email(email, first_name, invite_token);

  return new_user.rows[0];
};

const deactivate_staff = async (organisation_id: number, user_id: number) => {
  const user = await pool.query(
    `SELECT id, organisation_id
        FROM users
        WHERE id = $1`,
    [user_id],
  );
  if (
    user.rows.length === 0 ||
    user.rows[0].organisation_id !== organisation_id
  ) {
    throw new Error("Staff member not found in this organisation");
  }

  await pool.query(
    `UPDATE users
    SET active = false
    WHERE id = $1`,
    [user_id],
  );
  await pool.query(
    `UPDATE refresh_tokens
    SET revoked = true
    WHERE user_id = $1`,
    [user_id],
  );
};

const reset_staff_password = async (
  organisation_id: number,
  user_id: number,
) => {
  const user = await pool.query(
    `SELECT id, first_name, email, organisation_id, active
    FROM users
    WHERE id = $1`,
    [user_id],
  );

  if (
    user.rows.length === 0 ||
    user.rows[0].organisation_id !== organisation_id
  ) {
    throw new Error("Staff member not found in this organisation");
  }
  if (!user.rows[0].active) {
    throw new Error("Cannot reset password for an inactive staff member");
  }
  const reset_token = crypto.randomUUID();
  const token_hash = crypto
    .createHash("sha256")
    .update(reset_token)
    .digest("hex");
  const expires_at = new Date();
  expires_at.setHours(expires_at.getHours() + 1);

  //invalidates previous reset requests
  await pool.query(
    `UPDATE password_reset_tokens SET used = true WHERE user_id = $1 AND used = false`,
    [user_id],
  );

  await pool.query(
    `INSERT INTO password_reset_tokens 
    (user_id, token_hash, expires_at)
    VALUES ($1, $2, $3)`,
    [user_id, token_hash, expires_at],
  );

  await send_password_reset_email(
    user.rows[0].email,
    user.rows[0].first_name,
    reset_token,
  );
};

export default {
  list_staff,
  create_staff,
  deactivate_staff,
  reset_staff_password,
};
