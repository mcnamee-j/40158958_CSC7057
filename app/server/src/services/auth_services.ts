import pool from "../config/db.js";
import jwt from "jsonwebtoken";
import { User } from "../types/types.js";

//login
const login = async (email: string, password: string) => {
  //find user
  //store user
  //check entered password vs stored password
  // 1) invalid credentials => rejected
  // 2) access token is created
  // expiry/refresh token - saved in db
  // update login time
};
// token data returned here

//logout

//refresh token?
