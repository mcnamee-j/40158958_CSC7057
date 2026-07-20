import pool from "../config/db.js";
import type { CreateQueryInput, Query } from "../types/query_types.js";
import type { AuthenticatedUser } from "../types/types.js";

//create query - as per sequence diagram
const create_query = async (
  user: AuthenticatedUser,
  input: CreateQueryInput,
): Promise<Query> => {
  //check org links
  const link = await pool.query(
    `SELECT *
    FROM organisation_links
    WHERE (pharmacy_id = $1 AND gp_surgery_id = $2)
    OR (gp_surgery_id = $1 AND pharmacy_id = $2)`,
    [user.organisationId, input.recipient_org_id],
  );

  if (link.rows.length === 0) {
    throw new Error("Organisations are not linked");
  }
  //check if patient ref is needed

  //create query

  //log

  //notification created

  return;
};
