import pool from "../config/db.js";
import jwt from "jsonwebtoken";
import type { User } from "../types/types.js";
import bcrypt from "bcrypt";

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

//refresh token?

export default { login };
