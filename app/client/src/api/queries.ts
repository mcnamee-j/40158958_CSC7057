import { api } from "./client";
import type {
  CreateQueryInput,
  Query,
  QueryListFilters,
  QueryListResponse,
  QueryDetailResponse,
  QueryStatus,
} from "../types/query.types";

export const create_query = async (input: CreateQueryInput): Promise<Query> => {
  const { data } = await api.post<{ query: Query }>("/api/queries", input);
  return data.query;
};

export const get_queries = async (
  filters: QueryListFilters = {},
): Promise<QueryListResponse> => {
  const { data } = await api.get<QueryListResponse>("/api/queres", {
    params: filters,
  });
  return data;
};

export const get_query_by_id = async (
  id: number,
): Promise<QueryDetailResponse> => {
  const { data } = await api.get<QueryDetailResponse>(`/api/queries/${id}`);
  return data;
};

export const add_reply = async (
  id: number,
  body: string,
  is_internal = false,
) => {
  const { data } = await api.post<{ reply: unknown }>(
    `/api/queries/${id}/replies`,
    { body, is_internal },
  );
  return data.reply;
};

export const update_status = async (
  id: number,
  status: QueryStatus,
  resolution_note?: string,
): Promise<Query> => {
  const { data } = await api.patch<{ query: Query }>(
    `/api/queries/${id}/status`,
    { status, resolution_note },
  );
  return data.query;
};

export const assign_query = async (
  id: number,
  assigned_to: number,
  escalate = false,
): Promise<Query> => {
  const { data } = await api.patch<{ query: Query }>(
    `/api/queries/${id}/assign`,
    { assigned_to, escalate },
  );
  return data.query;
};
