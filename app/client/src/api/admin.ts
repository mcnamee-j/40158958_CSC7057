import { api } from "./client";

export interface Overview {
  organisations: { type: string; count: string }[];
  users: { role: string; count: string }[];
  queries: { status: string; count: string }[];
  organisation_links: number;
}

export interface Organisation {
  id: number;
  name: string;
  type: "pharmacy" | "gp_surgery";
  address: string | null;
  phone: string | null;
  email: string | null;
  active: boolean;
}

export interface Organisation_Link {
  id: number;
  pharmacy_id: number;
  pharmacy_name: string;
  gp_surgery_id: number;
  gp_surgery_name: string;
}

export const get_admin_overview = async (): Promise<Overview> => {
  const { data } = await api.get<Overview>("/api/admin/overview");
  return data;
};

export const list_organisations = async (): Promise<Organisation[]> => {
  const { data } = await api.get<{ organisations: Organisation[] }>(
    "/api/admin/organisations",
  );
  return data.organisations;
};

export const create_organisation = async (input: {
  name: string;
  type: "pharmacy" | "gp_surgery";
  address?: string;
  phone?: string;
  email?: string;
}): Promise<Organisation> => {
  const { data } = await api.post<{ organisation: Organisation }>(
    "/api/admin/organisations",
    input,
  );
  return data.organisation;
};

export const list_organisations_links = async (): Promise<
  Organisation_Link[]
> => {
  const { data } = await api.get<{ links: Organisation_Link[] }>(
    "/api/admin/organisation-links",
  );
  return data.links;
};

export const create_organisation_link = async (
  pharmacy_id: number,
  gp_surgery_id: number,
): Promise<Organisation_Link> => {
  const { data } = await api.post<{ link: Organisation_Link }>(
    "/api/admin/organisation-links",
    {
      pharmacy_id,
      gp_surgery_id,
    },
  );
  return data.link;
};

export const deactivate_organisation = (id: number) =>
  api.patch(`/api/admin/organisations/${id}/deactivate`);

export const reactivate_organisation = (id: number) =>
  api.patch(`/api/admin/organisations/${id}/reactivate`);
