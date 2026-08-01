import { Pool, types } from "pg";
import dotenv from "dotenv";

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
