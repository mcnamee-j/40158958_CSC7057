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

//DB types

export interface Organisation {
  id: number;
  name: string;
  type: OrganisationType;
  address: string | null;
  phone: string | null;
  email: string;
  active: boolean;
  created_at: Date;
}

export interface User {
  id: number;
  organisation_id: number;
  first_name: string;
  last_name: string;
  email: string;
  hashed_password: string;
  role: UserRole;
  active: boolean;
  created_at: Date;
  last_login: Date | null;
}

export interface Patient {
  id: number;
  initials: string;
  dob: Date;
  hcn: string;
}

export interface Query {
  id: number;
  ref_number: string;
  patient_id: number | null;
  sender_org_id: number;
  recipient_org_id: number;
  created_by: number;
  assigned_to: number | null;
  category: QueryCategory;
  priority: QueryPriority;
  status: QueryStatus;
  subject: string;
  resolution_note: string | null;
  resolved_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface QueryReply {
  id: number;
  query_id: number;
  sender_id: number;
  body: string;
  is_internal: boolean;
  read_at: Date | null;
  sent_at: Date;
}

export interface Notification {
  id: number;
  user_id: number;
  query_id: number | null;
  type: NotificationType;
  message: string;
  is_read: boolean;
  created_at: Date;
}

export interface AuditLog {
  id: number;
  user_id: number | null;
  query_id: number | null;
  action: string;
  old_value: string | null;
  new_value: string | null;
  performed_at: Date;
}
