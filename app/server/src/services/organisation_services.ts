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

const get_org_staff = async (user: AuthenticatedUser) => {
  const result = await pool.query(
    `SELECT id, first_name, last_name, role
    FROM users
    WHERE organisation_id = $1
    AND active = true
    and id != $2
    ORDER BY first_name`,
    [user.organisationId, user.userId],
  );

  return result.rows;
};

export default { get_linked_organisations, get_org_staff };
