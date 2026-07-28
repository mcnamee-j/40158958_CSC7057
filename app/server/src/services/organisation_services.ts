import pool from "../config/db.js";
import type { AuthenticatedUser } from "../types/types.js";

const get_linked_organisations = async (user: AuthenticatedUser) => {
  const result = await pool.query(
    `SELECT organisations.id, organisations.name, organisations.type
     FROM organisation_links
     JOIN organisations
     ON organisations.id = CASE
     WHEN organisation_links.pharmacy_id = $1 THEN organisation_links.gp_surgery_id
     ELSE organisation_links.pharmacy_id
     END
     WHERE organisation_links.pharmacy_id = $1
     OR organisation_links.gp_surgery_id = $1`,
    [user.organisationId],
  );
  return result.rows;
};

export default { get_linked_organisations };
