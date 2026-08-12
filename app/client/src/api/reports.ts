import { api } from "./client";

export interface Statistics {
  total_queries: number;
  resolved_queries: number;
  percentage_resolved: number;
  avg_resolution_seconds: number | null;
}

export const get_performance_stats = async (): Promise<Statistics> => {
  const { data } = await api.get<Statistics>("/api/reports/resolution-stats");
  return data;
};
