import { api, set_access_token } from "./client";

interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: {
    id: number;
    first_name: string;
    last_name: string;
    role: string;
    organisation: number;
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

export const forgotPassword = (email: string) =>
  api.post("/api/auth/forgot_password", { email });

export const resetPassword = (token: string, new_password: string) =>
  api.post("/api/auth/reset_password", { token, new_password });
