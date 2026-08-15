import pool from "../config/db.js";
import type { NotificationType } from "../types/query_types.js";

//create org-wide notification
const create_notification = async (
  recipient_org_id: number,
  query_id: number,
  type: NotificationType,
  message: string,
) => {
  //who should get it
  const users = await pool.query(
    `SELECT id
    FROM users
    WHERE organisation_id = $1
    AND active = true`,
    [recipient_org_id],
  );

  if (users.rows.length === 0) return; //no active users therefore no notification needed - returns

  //generates single multi-row INSERT sql statement (already have query_id, type and message and array of users)
  // to notify every active user in the org in one query, instead of N queries
  const values: string[] = [];
  const params: (number | string | boolean)[] = [];

  users.rows.forEach((row, index) => {
    const user = index * 5;
    values.push(
      `($${user + 1}, $${user + 2}, $${user + 3}, $${user + 4}, $${user + 5})`,
    );
    params.push(row.id, query_id, type, message, false);
  });

  //insert into db
  await pool.query(
    `INSERT INTO notifications
    (user_id, query_id, type, message, is_read)
    VALUES ${values.join(", ")}`,
    params,
  );
};

//need notification for only one user
const create_user_notification = async (
  user_id: number,
  query_id: number,
  type: NotificationType,
  message: string,
) => {
  await pool.query(
    `INSERT INTO notifications
    (user_id, query_id, type, message, is_read)
    VALUES ($1, $2, $3, $4, false)`,
    [user_id, query_id, type, message],
  );
};

//list user notifications
const get_notifications_user = async (user_id: number) => {
  const response = await pool.query(
    `SELECT id, query_id, type, message, is_read, created_at
    FROM notifications
    WHERE user_id = $1
    ORDER BY created_at DESC
    LIMIT 50`,
    [user_id],
  );
  //returns whole object - return only array of notifications
  return response.rows;
};

//mark single notification as read - other users shouldnt be able to mark a users notification as read
const mark_notification_read = async (
  user_id: number,
  notification_id: number,
) => {
  const response = await pool.query(
    `UPDATE notifications
    SET is_read = true
    WHERE id = $1
    AND user_id = $2
    RETURNING id`,
    [notification_id, user_id],
  );
  if (response.rows.length === 0) {
    throw new Error("Notification not found");
  }
};

//mark all read
const mark_all_read = async (user_id: number) => {
  await pool.query(
    `UPDATE notifications
    SET is_read = true
    WHERE user_id = $1
    AND is_read = false`,
    [user_id],
  );
};

export default {
  create_notification,
  create_user_notification,
  get_notifications_user,
  mark_notification_read,
  mark_all_read,
};
