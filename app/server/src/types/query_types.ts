export type QueryStatus =
  | "new"
  | "in_progress"
  | "awaiting_response"
  | "escalated"
  | "resolved";

export type QueryPriority = "low" | "medium" | "high";

export type QueryCategory =
  | "stock"
  | "prescription"
  | "patient"
  | "routine"
  | "other";

export interface PatientReferences {
  initials?: string;
  dob?: string; //date
  hcn?: string; //health&care number
}

export interface CreateQueryInput {
  recipient_org_id: number;
  category: QueryCategory;
  priority?: QueryPriority; // defaults to 'medium'
  patient?: PatientReferences;
  subject: string;
  body: string;
}

export interface Query {
  id: number;
  reference_number: string;
  patient_id: number | null;
  sender_org_id: number;
  recipient_org_id: number;
  created_by: number;
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
