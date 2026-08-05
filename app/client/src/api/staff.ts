import { api } from "./client";

export interface Staff_Member {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  active: boolean;
}

export const list_staff = async (
  organisation_id?: number,
): Promise<Staff_Member[]> => {
  const { data } = await api.get<{ staff: Staff_Member[] }>("/api/staff", {
    params: organisation_id ? { organisation_id } : undefined,
  });
  return data.staff;
};

export const create_staff = async (
  input: { first_name: string; last_name: string; email: string; role: string },
  organisation_id?: number,
): Promise<Staff_Member> => {
  const { data } = await api.post<{ staff: Staff_Member }>("/api/staff", {
    ...input,
    organisation_id,
  });
  return data.staff;
};

export const deactivate_staff = (id: number, organisation_id?: number) => {
  api.patch(`/api/staff/${id}/deactivate`, { organisation_id });
};
