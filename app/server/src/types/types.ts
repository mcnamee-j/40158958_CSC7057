//enums
export type OrganisationType = "pharmacy" | "gp_surgery";

export type UserRole =
  | "admin"
  | "pharmacy_manager"
  | "practice_manager"
  | "pharmacy_staff"
  | "practice_staff";

export type QueryCategory =
  | "prescription"
  | "stock"
  | "patient"
  | "routine"
  | "other";

export type QueryPriority = "high" | "medium" | "low";

export type QueryStatus = "new" | "in_progress" | "resolved";

export type NotificationType =
  | "query_assigned"
  | "query_update"
  | "query_reply";
