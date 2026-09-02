// Verifies the database is reachable before starting the HTTP server,
// so the app fails fast on startup rather than accepting requests then failing

import app from "./app.js";
import pool from "./config/db.js";

const PORT = process.env.SERVER_PORT;

pool
  .query(`SELECT 1`)
  .then(() => {
    console.log("PostgreSQL connected");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("PostgreSQL connection failed:", err.message);
    process.exit(1); //crashes rather than runs in broken state
  });
