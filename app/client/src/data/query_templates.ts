// [ENTER ... HERE] placeholders are intentional — itended for staff to replace these
// manually before sending

import type { QueryCategory, QueryPriority } from "../types/query.types";

export interface Query_Template {
  id: string;
  label: string;
  category: QueryCategory;
  priority: QueryPriority;
  subject: string;
  body: string;
}

export const QUERY_TEMPLATES: Query_Template[] = [
  {
    id: "stock_shortage",
    label: "Stock shortage - request alternative",
    category: "stock",
    priority: "high",
    subject: "[ENTER ITEM HERE] is out of stock",
    body: "Hi, we are currently unable to get the above item from our suppliers. Could you please issue a new prescription with a suitable alternative? Many thanks",
  },
  {
    id: "dosage_query",
    label: "Dosage query",
    category: "patient",
    priority: "medium",
    subject: "Dosage query for patient",
    body: "Hi, we have a query regarding the prescribed dosage of this patient's [ENTER MEDICATION DETAILS HERE]. Could you confirm this is correct as issued?",
  },
  {
    id: "missing_prescription",
    label: "Missing prescription",
    category: "prescription",
    priority: "medium",
    subject: "Missing prescription",
    body: "Hi, we wanted to check has a prescription for [ENTER MISSING MEDICATION] has been issued for this patient?",
  },
  {
    id: "missing_repeat_prescription",
    label: "Missing repeat prescription",
    category: "prescription",
    priority: "medium",
    subject: "Missing repeat prescription",
    body: "Hi, we wanted to check has a repeat prescription for [ENTER MISSING MEDICATION] been issued for this patient as it is now due?",
  },
  {
    id: "reorder_prescription",
    label: "Reorder prescription",
    category: "prescription",
    priority: "high",
    subject: "Reorder request",
    body: "Hi, we wanted to reorder [ENTER MEDICATION HERE] for the assigned patient please. Thanks",
  },
];
