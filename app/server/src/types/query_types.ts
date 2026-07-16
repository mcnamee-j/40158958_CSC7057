export type QueryStatus =
  | "new"
  | "in_progress"
  | "awaiting_response"
  | "escalated"
  | "resolved";

export type QueryPriority = "low" | "medium" | "high";

export type QueryCategory =
  | "medicine_shortage"
  | "prescription_clarification"
  | "dosage_query"
  | "interaction_check"
  | "administrative"
  | "other";

export interface PatientReferences {
  initials?: string;
  dob?: string; //date
  hcn?: string; //health&care number
}

export interface CreateQueryInput {
  recipient_org_id: string;
  category: QueryCategory;
  priority?: QueryPriority; // defaults to 'medium'
  patient?: PatientReferences;
  subject: string;
  body: string;
}

export interface Query {
  id: string;
  reference_number: string;
  patient_id: string | null;
  sender_org_id: string;
  recipient_org_id: string;
  created_by: string;
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
  id: string;
  query_id: string;
  sender_id: string;
  body: string;
  is_internal: boolean;
  read_at: Date | null;
  sent_at: Date;
}
