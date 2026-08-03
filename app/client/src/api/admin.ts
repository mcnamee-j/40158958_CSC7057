import { api } from "./client";

export interface Overview {
  organisations: { type: string; count: string }[];
  users: { role: string; count: string }[];
  queries: { status: string; count: string }[];
  organisation_links: number;
}

export const get_admin_overview = async (): Promise<Overview> => {
  const { data } = await api.get<Overview>("/api/admin/overview");
  return data;
};
