//enums
export type OrganisationType = "pharmacy" | "gp_surgery";

export type UserRole =
  | "admin"
  | "pharmacy_manager"
  | "practice_manager"
  | "pharmacy_staff"
  | "practice_staff";

export interface AuthenticatedUser {
  userId: number;
  role: string;
  organisationId: string;
}

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

export interface AuditLog {
  id: number;
  user_id: number | null;
  query_id: number | null;
  action: string;
  old_value: string | null;
  new_value: string | null;
  performed_at: Date;
}
