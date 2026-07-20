import pool from "../config/db.js";
import type { NotificationType } from "../types/query_types.js";

//create notification
const create_notifcation = async (
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

  //genrate bulk insert sql statement (already have query_id, type and message and array of users)
  //require our parameters and values - capture in two new and empty arrays - cycle through each user to fill remaining values
  // there are 5 values per insert statement, therefore every index*5 = a new user
  const values: string[] = [];
  const params: (number | string | boolean)[] = [];

  users.rows.forEach((row, index) => {
    const user = index * 5;
    values.push(
      `$${user + 1}, $${user + 2}, $${user + 3}, $${user + 4}, $${user + 5}`,
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

export default { create_notifcation, create_user_notification };
