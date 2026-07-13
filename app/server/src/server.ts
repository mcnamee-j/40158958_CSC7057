import app from "./app.js";
import pool from "./config/db.js";

const PORT = 3000;

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
    process.exit(1);
  });
