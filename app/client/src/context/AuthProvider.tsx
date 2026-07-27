import { useState, useEffect, type ReactNode } from "react";
import { login as api_login, logout as api_logout } from "../api/auth";
import { set_on_auth_failure } from "../api/client";
import { AuthContext, type User } from "./AuthContext";

//need to decode JWT - 3 parts separated by '.' (note this does not verfy token)
const decode_token = (token: string): Partial<User> | null => {
  try {
    const payload = token.split(".")[1]; //gets payload (base 64 encoded)
    return JSON.parse(atob(payload)); //atob decodes into text - parsed into JSON object
  } catch {
    return null;
  }
};

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

        const decoded = decode_token(data.access_token); //decode to get user
        if (decoded) setUser(decoded as User); //save logged in user info
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
    console.log("api_user:", api_user); // temporary
    setUser({
      user_id: api_user.id,
      role: api_user.role,
      organisation_id: api_user.organisation,
      first_name: api_user.first_name,
      last_name: api_user.last_name,
    });
  };

  const logout = async () => {
    await api_logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
