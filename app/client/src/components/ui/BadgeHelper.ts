import type { QueryPriority, QueryStatus } from "../../types/query.types";

export const priority_variant: Record<
  QueryPriority,
  "danger" | "warning" | "success"
> = {
  high: "danger",
  medium: "warning",
  low: "success",
};

export const priority_label: Record<QueryPriority, string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
};

export const status_variant: Record<
  QueryStatus,
  "neutral" | "accent" | "warning" | "danger" | "success"
> = {
  new: "neutral",
  in_progress: "accent",
  awaiting_response: "warning",
  escalated: "danger",
  resolved: "success",
};

export const status_label: Record<QueryStatus, string> = {
  new: "New",
  in_progress: "In progress",
  awaiting_response: "Awaiting response",
  escalated: "Escalated",
  resolved: "Resolved",
};

export const AGE_THRESHOLD_SECONDS = 24 * 60 * 60; //1day

export const is_old = (
  status: QueryStatus,
  elapsed_seconds?: number,
): boolean =>
  status !== "resolved" && (elapsed_seconds ?? 0) > AGE_THRESHOLD_SECONDS;
