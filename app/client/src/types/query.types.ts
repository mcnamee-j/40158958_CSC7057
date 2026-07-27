export type QueryStatus =
  | "new"
  | "in_progress"
  | "awaiting_response"
  | "escalated"
  | "resolved";

export type QueryPriority = "low" | "medium" | "high";

export type QueryCategory =
  | "prescription"
  | "stock"
  | "patient"
  | "routine"
  | "other";

export interface PatientReferences {
  initials?: string;
  dob?: string;
  hcn?: string;
}

export interface CreateQueryInput {
  recipient_org_id: number;
  category: QueryCategory;
  priority?: QueryPriority;
  patient?: PatientReferences;
  subject: string;
  body: string;
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
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
  elapsed_seconds?: number;
}

export interface QueryReply {
  id: number;
  query_id: number;
  sender_id: number;
  sender_org_id?: number; //in some GET responses
  body: string;
  is_internal: boolean;
  read_at: string | null;
  sent_at: string;
}

export interface QueryListFilters {
  status?: QueryStatus;
  priority?: QueryPriority;
  category?: QueryCategory;
  search?: string;
  page?: number;
  limit?: number;
}

export interface QueryListResponse {
  queries: Query[];
  total: number;
}

export interface QueryDetailResponse {
  query: Query;
  replies: QueryReply[];
}
