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

const create_organisation = async (
  name: string,
  type: string,
  address: string | undefined,
  phone: string | undefined,
  email: string | undefined,
) => {
  if (type !== "pharmacy" && type !== "gp_surgery") {
    throw new Error("Invalid organisation type");
  }

  const result = await pool.query(
    `INSERT INTO organisations
    (name, type, address, phone, email)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *`,
    [name, type, address ?? null, phone ?? null, email ?? null],
  );
  return result.rows[0];
};

const list_organisations = async () => {
  const result = await pool.query(
    `SELECT id, name, type, address, phone, email, active
    FROM organisations
    WHERE type != 'system'
    ORDER BY name`,
  );
  return result.rows;
};

const list_organisation_links = async () => {
  const result = await pool.query(
    `SELECT organisation_links.id, pharmacy.id AS pharmacy_id,
    pharmacy.name AS pharmacy_name, gp.id AS gp_surgery_id, gp.name AS gp_surgery_name
    FROM organisation_links
    JOIN organisations pharmacy ON organisation_links.pharmacy_id = pharmacy.id
    JOIN organisations gp ON organisation_links.gp_surgery_id = gp.id
    ORDER BY pharmacy.name`,
  );
  return result.rows;
};

const create_organisation_link = async (
  pharmacy_id: number,
  gp_surgery_id: number,
) => {
  const orgs = await pool.query(
    `SELECT id, type 
    FROM organisations
    WHERE id
    IN ($1, $2)`,
    [pharmacy_id, gp_surgery_id],
  );

  const pharmacy = orgs.rows.find((org) => org.id === pharmacy_id);
  const gp_surgery = orgs.rows.find((org) => org.id === gp_surgery_id);

  if (!pharmacy || pharmacy.type !== "pharmacy") {
    throw new Error("Invalid pharmacy organisation");
  }
  if (!gp_surgery || gp_surgery.type !== "gp_surgery") {
    throw new Error("Invalid GP surgery organisation");
  }

  try {
    const result = await pool.query(
      `INSERT INTO organisation_links (pharmacy_id, gp_surgery_id)
      VALUES ($1, $2)
      RETURNING *`,
      [pharmacy_id, gp_surgery_id],
    );
    return result.rows[0];
  } catch (e: any) {
    if (e.code === "23505") {
      //unique violation code from Postgres
      throw new Error("Organisations are already linked");
    }
    throw e;
  }
};

export default {
  get_admin_overview,
  create_organisation,
  list_organisations,
  list_organisation_links,
  create_organisation_link,
};
