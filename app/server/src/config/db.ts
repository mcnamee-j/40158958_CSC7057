import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

const dbData = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

dbData.on("connect", () => {
  console.log("Connected to PostgreSQL");
});

dbData.on("error", (e) => {
  console.log("PostgreSQL connection error", e);
});
