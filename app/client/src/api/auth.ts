import { api, set_access_token } from "./client";

interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    role: string;
    organisation: number;
    organisation_name: string;
  };
}

export const login = async (email: string, password: string) => {
  //call endpoint, store tokens and user object
  const { data } = await api.post<LoginResponse>("/api/auth/login", {
    email,
    password,
  });
  set_access_token(data.access_token);
  localStorage.setItem("refresh_token", data.refresh_token); //stored in local storage to survive reloads (can be revoked in backend)
  return data.user;
};

export const logout = async () => {
  const refresh_token = localStorage.getItem("refresh_token");
  if (refresh_token) {
    await api.post("/api/auth/logout", { refresh_token }).catch(() => {}); //if logout request fails, ignore the error and logout locally
  }
  set_access_token(null);
  localStorage.removeItem("refresh_token");
};

export const forgot_password = (email: string) =>
  api.post("/api/auth/forgot_password", { email });

export const reset_password = (token: string, new_password: string) =>
  api.post("/api/auth/reset_password", { token, new_password });

export const getUser = () =>
  api.get<{ user: LoginResponse["user"] }>("/api/auth/get_user");

export const update_profile = async (input: {
  first_name: string;
  last_name: string;
  email: string;
}) => {
  const { data } = await api.patch<{ user: LoginResponse["user"] }>(
    "/api/auth/update",
    input,
  );
  return data.user;
};
