// Provides authentication state to the whole app. On mount, attempts to
// restore a session from a stored refresh token before rendering children.

import { useState, useEffect, type ReactNode } from "react";
import { login as api_login, logout as api_logout } from "../api/auth";
import { set_on_auth_failure, refresh_attempt } from "../api/client";
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

      //if refresh token exists...
      try {
        const refreshed = await refresh_attempt();
        if (!refreshed) throw new Error("Refresh failed");

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
