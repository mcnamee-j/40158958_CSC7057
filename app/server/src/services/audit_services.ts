import pool from "../config/db.js";

//should be append only (no updates or deletes)
const log_action = async (
  user_id: number,
  query_id: number | null,
  action: string,
  old_value: string | null,
  new_value: string | null,
) => {
  await pool.query(
    `INSERT INTO audit_log (user_id, query_id, action, old_value, new_value, performed_at)
     VALUES ($1, $2, $3, $4, $5, NOW())`,
    [user_id, query_id, action, old_value, new_value],
  );
};

export default { log_action };
