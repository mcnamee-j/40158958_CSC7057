import pool from "../config/db.js";

const get_statistics = async (organisation_id: number) => {
  const result = await pool.query(
    // FILTER: conditional aggregation within a single query,
    // avoids two separate queries
    `SELECT 
        COUNT(*) FILTER (WHERE status = 'resolved') AS resolved_count,
        COUNT(*) AS total_count,
        AVG(EXTRACT(EPOCH FROM (resolved_at - created_at)))
        FILTER (WHERE status = 'resolved') AS avg_resolution_seconds
        FROM queries
        WHERE sender_org_id = $1 OR recipient_org_id = $1`,
    [organisation_id],
  );

  const row = result.rows[0];
  const total = parseInt(row.total_count, 10);
  const resolved = parseInt(row.resolved_count, 10);

  return {
    total_queries: total,
    resolved_queries: resolved,
    percentage_resolved: total > 0 ? Math.round((resolved / total) * 100) : 0,
    avg_resolution_seconds: row.avg_resolution_seconds
      ? Math.round(Number(row.avg_resolution_seconds))
      : null,
  };
};

export default { get_statistics };
