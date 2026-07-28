import { api } from "./client";

export interface LinkedOrganisation {
  id: number;
  name: string;
  type: "pharmacy" | "gp_surgery";
}

export const get_linked_orgs = async (): Promise<LinkedOrganisation[]> => {
  const { data } = await api.get<{ organisations: LinkedOrganisation[] }>(
    "/api/organisations/linked",
  );
  return data.organisations;
};
