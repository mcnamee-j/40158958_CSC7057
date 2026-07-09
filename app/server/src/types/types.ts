//enums
type Organisation_Type = "pharmacy" | "gp_surgery";

type User_Role =
  | "admin"
  | "pharmacy_manager"
  | "practice_manager"
  | "pharmacy_staff"
  | "practice_staff";

type Query_Category =
  | "prescription"
  | "stock"
  | "patient"
  | "routine"
  | "other";

type Query_Priority = "high" | "medium" | "low";

type Query_Status = "new" | "in_progress" | "resolved";

type Notification_Type = "query_assigned" | "query_update" | "query_reply";

export type {
  Organisation_Type,
  User_Role,
  Query_Category,
  Query_Priority,
  Query_Status,
  Notification_Type,
};
