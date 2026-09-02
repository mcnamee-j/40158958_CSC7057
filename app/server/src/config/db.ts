// Shared PostgreSQL connection pool, configured from environment variables.
// Imported across services/controllers/tests for all database access.

import { Pool, types } from "pg";
import dotenv from "dotenv";

// must run before Pool is constructed so DB_* env vars are available
dotenv.config();

//stop postgres from converting dates into JS DATE objects (timezone issues shift the date)
//return string value only instead
types.setTypeParser(types.builtins.DATE, (value: string) => value);

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

export default pool;
