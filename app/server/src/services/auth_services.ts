import pool from "../config/db.js";
import jwt from "jsonwebtoken";
import { User } from "../types/types.js";
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
  const user = userSearch.rows[0];

  // 1) invalid credentials => rejected
  if (!user || !user.active) {
    throw new Error("Invalid Credentials");
  }
  // 2) check entered password vs stored password (use bcrypt.compare) then access token is created
  // expiry/refresh token - saved in db
  // update login time
};
// token data returned here

//logout

//refresh token?
