import pool from "../config/db.js";
import type { CreateQueryInput, Query } from "../types/query_types.js";
import type { AuthenticatedUser } from "../types/types.js";
import generate_ref_number from "../utils/reference_number_genrator.js";
import audit_services from "./audit_services.js";
import notification_services from "./notification_services.js";
import patient_services from "./patient_services.js";

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
  const patient_id = await patient_services.find_or_create_patient(
    input.patient,
  );
  //create query - ref number has low chance of duplication - can catch this as unique_violation error(23505) and rerun insert as a failsafe
  let ref_number = generate_ref_number();
  let query_data;

  for (let insert_attempts = 0; insert_attempts < 2; insert_attempts++) {
    try {
      query_data = await pool.query(
        `INSERT INTO queries
            (ref_number, patient_id, sender_org_id, recipient_org_id, created by,
            category, priority, status, subject, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, 'new, $8, NOW(), NOW())
            RETURNING *`,
        [
          ref_number,
          patient_id,
          user.organisationId,
          input.recipient_org_id,
          user.userId,
          input.category,
          input.priority ?? "medium",
          input.subject,
        ],
      );
      break;
    } catch (e: any) {
      if (e.code === "23505" && insert_attempts === 0) {
        ref_number = generate_ref_number();
        continue;
      }
      throw e;
    }
  }

  const query = query_data!.rows[0];

  //store query body as first message in query_replies
  await pool.query(
    `INSERT INTO query_replies
    (query_id, sender_id, body, is_internal, sent_at)
    VALUES ($1, $2, $3, false, NOW())`,
    [query.id, user.userId, input.body],
  );

  //log
  await audit_services.log_action(
    user.userId,
    query.id,
    "query_created",
    null,
    ref_number,
  );

  //notification created
  await notification_services.create_notifcation(
    input.recipient_org_id,
    query.id,
    "query_reply",
    `New query ${ref_number}: ${input.subject}`,
  );

  return query;
};

export default { create_query };
