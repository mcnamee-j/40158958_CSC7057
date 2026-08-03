import pool from "../config/db.js";
import type {
  CreateQueryInput,
  Query,
  QueryStatus,
} from "../types/query_types.js";
import type { AuthenticatedUser } from "../types/types.js";
import generate_ref_number from "../utils/reference_number_genrator.js";
import audit_services from "./audit_services.js";
import notification_services from "./notification_services.js";
import patient_services from "./patient_services.js";
import { QUERY_STATUSES } from "../types/query_types.js";

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
            (ref_number, patient_id, sender_org_id, recipient_org_id, created_by,
            category, priority, status, subject, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, 'new', $8, NOW(), NOW())
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
  await notification_services.create_notification(
    input.recipient_org_id,
    query.id,
    "query_reply",
    `New query ${ref_number}: ${input.subject}`,
  );

  return query;
};

//get user organisation queries - include filters @ sql level
const get_org_queries = async (
  user: AuthenticatedUser,
  filters: {
    status?: string | undefined;
    priority?: string | undefined;
    category?: string | undefined;
    search?: string | undefined;
    patient_initials?: string | undefined;
    patient_dob?: string | undefined;
    patient_hcn?: string | undefined;
    org_id?: number | undefined;
    date?: string | undefined;
    page?: number | undefined; //if i implement pagination of filtered results
    limit?: number | undefined;
  },
) => {
  //build sql statement uisng if statements and .push
  const conditions: string[] = [
    `(queries.sender_org_id = $1 OR queries.recipient_org_id = $1)`,
  ];
  const params: (string | number)[] = [user.organisationId];

  if (filters.status) {
    params.push(filters.status);
    conditions.push(`queries.status = $${[params.length]}`);
  }

  if (filters.priority) {
    params.push(filters.priority);
    conditions.push(`queries.priority = $${[params.length]}`);
  }

  if (filters.category) {
    params.push(filters.category);
    conditions.push(`queries.category = $${[params.length]}`);
  }

  if (filters.search) {
    params.push(`%${filters.search}%`);
    conditions.push(
      `(queries.subject ILIKE $${[params.length]} OR queries.ref_number ILIKE $${[params.length]})`, //ILIKE is case insensitive
    );
  }

  if (filters.patient_initials) {
    params.push(filters.patient_initials);
    conditions.push(`patients.initials ILIKE $${[params.length]}`);
  }

  if (filters.patient_dob) {
    params.push(filters.patient_dob);
    conditions.push(`patients.dob = $${[params.length]}`);
  }

  if (filters.patient_hcn) {
    params.push(filters.patient_hcn);
    conditions.push(`patients.hcn = $${[params.length]}`);
  }

  if (filters.org_id) {
    params.push(filters.org_id);
    conditions.push(
      `(queries.sender_org_id = $${[params.length]} OR queries.recipient_org_id = $${[params.length]})`,
    );
  }

  if (filters.date) {
    params.push(filters.date);
    conditions.push(`queries.created_at::date = $${[params.length]}::date`);
  }

  //join all conditions together
  const where = conditions.join(" AND ");

  //pagination? - if lots of queries
  const page = filters.page && filters.page > 0 ? filters.page : 1; //if no page is passed by user it defaults to 1
  const limit = filters.limit && filters.limit > 0 ? filters.limit : 20; //default limit to 20 queries per page
  const page_offset = (page - 1) * limit; //determines how many rows are skipped per page of queries

  // total count after filters applied
  const results_count = await pool.query(
    `SELECT COUNT(*)
    FROM queries
    LEFT JOIN patients
    ON queries.patient_id = patients.id
    WHERE ${where}`,
    params,
  );
  const total = parseInt(results_count.rows[0].count, 10);

  //main query - also gets time elapsed since creation for adding visual flags to frontend (US - 23)
  params.push(limit, page_offset);
  const result = await pool.query(
    `SELECT queries.*,
    sender_org.name AS sender_org_name,
    recipient_org.name AS recipient_org_name,
    users.first_name AS created_by_first_name,
    users.last_name AS created_by_last_name,
    EXTRACT(EPOCH FROM (NOW() - queries.created_at))
    AS elapsed_seconds
    FROM queries
    JOIN organisations sender_org ON queries.sender_org_id = sender_org.id
    JOIN organisations recipient_org ON queries.recipient_org_id = recipient_org.id
    JOIN users ON queries.created_by = users.id
    LEFT JOIN patients ON queries.patient_id = patients.id
    WHERE ${where}
    ORDER BY queries.created_at DESC
    LIMIT $${params.length - 1}
    OFFSET $${params.length}`,
    params,
  );

  return { queries: result.rows, total };
};

const get_query_by_id = async (user: AuthenticatedUser, query_id: number) => {
  const query_result = await pool.query(
    `SELECT queries.*,
    sender_org.name AS sender_org_name,
    recipient_org.name AS recipient_org_name,
    creator.first_name AS created_by_first_name,
    creator.last_name AS created_by_last_name, 
    assignee.first_name AS assigned_to_first_name,
    assignee.last_name AS assigned_to_last_name,
    patients.initials as patient_initials,
    patients.dob as patient_dob,
    patients.hcn as patient_hcn,
    EXTRACT(EPOCH FROM (NOW() - queries.created_at)) AS elapsed_seconds
    FROM queries
    JOIN organisations sender_org ON queries.sender_org_id = sender_org.id
    JOIN organisations recipient_org ON queries.recipient_org_id = recipient_org.id
    JOIN users creator ON queries.created_by = creator.id
    LEFT JOIN users assignee ON queries.assigned_to = assignee.id
    LEFT JOIN patients ON queries.patient_id = patients.id
    WHERE queries.id = $1`,
    [query_id],
  );

  const query = query_result.rows[0];

  //if not found or found but user.org has no involvement
  if (
    !query ||
    (query.sender_org_id !== user.organisationId &&
      query.recipient_org_id !== user.organisationId)
  ) {
    return null;
  }

  //mark replies from other org as read
  await pool.query(
    `UPDATE query_replies
    SET read_at = NOW()
    WHERE query_id = $1
    AND read_at IS NULL
    AND is_internal = false
    AND sender_id 
    IN ( 
    SELECT id
    FROM users
    WHERE organisation_id != $2
    )`,
    [query_id, user.organisationId],
  );

  //then get thread
  const replies_result = await pool.query(
    `SELECT query_replies.*, 
    users.organisation_id AS sender_org_id,
    users.first_name AS sender_first_name,
    users.last_name AS sender_last_name,
    users.role AS sender_role,
    organisations.name AS sender_org_display_name
    FROM query_replies
    JOIN users ON query_replies.sender_id = users.id
    JOIN organisations ON users.organisation_id = organisations.id
    WHERE query_replies.query_id = $1
    ORDER BY query_replies.sent_at ASC`,
    [query_id],
  );

  //can filter out internal messages here before returning
  const replies = replies_result.rows.filter(
    (reply) =>
      !reply.is_internal || reply.sender_org_id === user.organisationId,
  );
  return { query, replies };
};

//ability to reply to a query
const add_reply = async (
  user: AuthenticatedUser,
  query_id: number,
  body: string,
  is_internal: boolean,
) => {
  const query_result = await pool.query(
    `SELECT * 
    FROM queries
    WHERE id = $1`,
    [query_id],
  );

  const query = query_result.rows[0];

  if (
    !query ||
    (query.sender_org_id !== user.organisationId &&
      query.recipient_org_id !== user.organisationId)
  ) {
    throw new Error("Query not found");
  }

  //add auto-status update
  const should_auto_update = !is_internal && query.status === "new";

  if (should_auto_update) {
    await pool.query(
      `UPDATE queries 
      SET status = 'in_progress'
      WHERE id = $1`,
      [query_id],
    );

    await audit_services.log_action(
      user.userId,
      query_id,
      "status_changed",
      "new",
      "in_progress",
    );
  }

  const reply_result = await pool.query(
    `INSERT INTO query_replies
    (query_id, sender_id, body, is_internal, sent_at)
    VALUES ($1, $2, $3, $4, NOW())
    RETURNING *`,
    [query_id, user.userId, body, is_internal],
  );

  //update 'updated_at'
  await pool.query(
    `UPDATE queries
    SET updated_at = NOW()
    WHERE id = $1`,
    [query_id],
  );

  await audit_services.log_action(
    user.userId,
    query_id,
    is_internal ? "internal_note_added" : "reply_added",
    null,
    null,
  );

  //figure out which org gets a notifcation when reply is added (internal notes should not notify other orgs)
  if (!is_internal) {
    //if internal skip
    const other_org_id =
      query.sender_org_id === user.organisationId
        ? query.recipient_org_id
        : query.sender_org_id;

    await notification_services.create_notification(
      other_org_id,
      query_id,
      "query_reply",
      `New reply on ${query.ref_number}: ${query.subject}`,
    );
  }
  return reply_result.rows[0];
};

//update query status
const update_status = async (
  user: AuthenticatedUser,
  query_id: number,
  new_status: string,
  resolution_note: string | undefined,
) => {
  if (!QUERY_STATUSES.includes(new_status as QueryStatus)) {
    throw new Error("Invalid status");
  }

  const query_result = await pool.query(
    `SELECT *
    FROM queries
    WHERE id = $1`,
    [query_id],
  );

  const query = query_result.rows[0];

  if (
    !query ||
    (query.sender_org_id !== user.organisationId &&
      query.recipient_org_id !== user.organisationId)
  ) {
    throw new Error("Query not found");
  }

  const old_status = query.status;
  const is_resolving = new_status === "resolved"; //checks if status is resolved, if not it is false

  const updated = await pool.query(
    `UPDATE queries
    SET status = $1,
    resolution_note = $2,
    resolved_at = ${is_resolving ? "NOW()" : "NULL"},
    updated_at = NOW()
    WHERE id = $3
    RETURNING *`,
    [
      new_status,
      is_resolving ? (resolution_note ?? null) : query.resolution_note,
      query_id,
    ],
  );

  if (is_resolving && resolution_note) {
    await pool.query(
      `INSERT INTO query_replies
        (query_id, sender_id, body, is_internal, sent_at)
        VALUES ($1, $2, $3, false, NOW())`,
      [query_id, user.userId, `Resolution summary: ${resolution_note}`],
    );
  }

  await audit_services.log_action(
    user.userId,
    query_id,
    "status_changed",
    old_status,
    new_status,
  );

  const other_org_id =
    query.sender_org_id === user.organisationId
      ? query.recipient_org_id
      : query.sender_org_id;

  await notification_services.create_notification(
    other_org_id,
    query_id,
    "query_updated",
    `${query.ref_number}: ${query.subject} - status changed to ${new_status}`,
  );

  return updated.rows[0];
};

//assign/reassign/escalate
const assign_query = async (
  user: AuthenticatedUser,
  query_id: number,
  assigned_to: number,
  escalate: boolean,
) => {
  const query_result = await pool.query(
    `SELECT *
    FROM queries
    WHERE id = $1`,
    [query_id],
  );

  const query = query_result.rows[0];

  if (
    !query ||
    (query.sender_org_id !== user.organisationId &&
      query.recipient_org_id !== user.organisationId)
  ) {
    throw new Error("Query not found");
  }

  //now reassign to staff within that org
  const staff_result = await pool.query(
    `SELECT *
    FROM users
    WHERE id = $1
    AND organisation_id = $2
    AND active = true`,
    [assigned_to, user.organisationId],
  );

  if (staff_result.rows.length === 0) {
    throw new Error("Invalid staff assignment");
  }

  const old_assigned_to = query.assigned_to;
  const new_status = escalate ? "escalated" : query.status;

  const update = await pool.query(
    `UPDATE queries
    SET assigned_to = $1,
    status = $2,
    updated_at = NOW()
    WHERE id = $3
    RETURNING *`,
    [assigned_to, new_status, query_id],
  );

  await audit_services.log_action(
    user.userId,
    query_id,
    "query_assigned",
    old_assigned_to ? String(old_assigned_to) : null,
    String(assigned_to),
  );

  if (escalate) {
    await audit_services.log_action(
      user.userId,
      query_id,
      "status_changed",
      query.status,
      "escalated",
    );
  }
  //individual notification (create notifiaction does full org staff)
  await notification_services.create_user_notification(
    assigned_to,
    query_id,
    "query_assigned",
    `You have been assigned to ${query.ref_number}: ${query.subject}`,
  );
  return update.rows[0];
};

export default {
  create_query,
  get_org_queries,
  get_query_by_id,
  add_reply,
  update_status,
  assign_query,
};
