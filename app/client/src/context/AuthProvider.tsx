import { useState, useEffect, type ReactNode } from "react";
import { login as api_login, logout as api_logout } from "../api/auth";
import { set_on_auth_failure } from "../api/client";
import { AuthContext, type User } from "./AuthContext";
import { getUser } from "../api/auth";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  //wraps application so that any page can access authentication
  const [user, setUser] = useState<User | null>(null); //stores logged in user
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    //runs once when provider is mounted
    set_on_auth_failure(() => setUser(null)); //logs user out automatically if auth fails

    const restore_session = async () => {
      const refresh_token = localStorage.getItem("refresh_token"); //gets refresh token
      if (!refresh_token) {
        setLoading(false);
        return;
      }

      //if resfresh token exists...
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL ?? "http://localhost:4000"}/api/auth/refresh`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refresh_token }),
          },
        );
        if (!res.ok) throw new Error("Refresh failed");
        const data = await res.json();

        const { set_access_token } = await import("../api/client"); //store new access token
        set_access_token(data.access_token);

        const getUserRes = await getUser();
        const api_user = getUserRes.data.user;
        setUser({
          user_id: api_user.id,
          role: api_user.role,
          organisation_id: api_user.organisation,
          organisation_name: api_user.organisation_name,
          first_name: api_user.first_name,
          last_name: api_user.last_name,
          email: api_user.email,
        });
      } catch {
        localStorage.removeItem("refresh_token"); //delete refresh - no longer valid
      } finally {
        setLoading(false);
      }
    };

    restore_session();
  }, []);

  const login = async (email: string, password: string) => {
    const api_user = await api_login(email, password);
    setUser({
      user_id: api_user.id,
      role: api_user.role,
      organisation_id: api_user.organisation,
      first_name: api_user.first_name,
      last_name: api_user.last_name,
      email: api_user.email,
      organisation_name: api_user.organisation_name,
    });
  };

  const logout = async () => {
    await api_logout();
    setUser(null);
  };

  //updates user info otherwise header info would be stale
  const refresh_user = async () => {
    const result = await getUser();
    const api_user = result.data.user;
    setUser({
      user_id: api_user.id,
      role: api_user.role,
      organisation_id: api_user.organisation,
      first_name: api_user.first_name,
      last_name: api_user.last_name,
      email: api_user.email,
      organisation_name: api_user.organisation_name,
    });
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, logout, refresh_user }}
    >
      {children}
    </AuthContext.Provider>
  );
};
