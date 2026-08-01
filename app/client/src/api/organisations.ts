import { api } from "./client";

export interface LinkedOrganisation {
  id: number;
  name: string;
  type: "pharmacy" | "gp_surgery";
}

export interface OrgStaffMember {
  id: number;
  first_name: string;
  last_name: string;
  role: string;
}

export const get_linked_orgs = async (): Promise<LinkedOrganisation[]> => {
  const { data } = await api.get<{ organisations: LinkedOrganisation[] }>(
    "/api/organisations/linked",
  );
  return data.organisations;
};

export const get_org_staff = async (): Promise<OrgStaffMember[]> => {
  const { data } = await api.get<{ staff: OrgStaffMember[] }>(
    "/api/organisations/staff",
  );
  return data.staff;
};
