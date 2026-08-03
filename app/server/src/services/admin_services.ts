import pool from "../config/db.js";

const get_admin_overview = async () => {
  const total_orgs = await pool.query(
    `SELECT type,
        COUNT(*)
        FROM organisations
        WHERE active = true
        GROUP BY type`,
  );

  const total_users = await pool.query(
    `SELECT role,
        COUNT(*)
        FROM users
        WHERE active = true
        GROUP BY role`,
  );

  const total_queries = await pool.query(
    `SELECT status,
        COUNT(*)
        FROM queries
        GROUP BY status`,
  );

  const total_links = await pool.query(
    `SELECT
        COUNT(*)
        FROM organisation_links`,
  );

  return {
    organisations: total_orgs.rows,
    users: total_users.rows,
    queries: total_queries.rows,
    organisation_links: parseInt(total_links.rows[0].count, 10),
  };
};

export default { get_admin_overview };
