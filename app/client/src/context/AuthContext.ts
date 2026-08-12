import { createContext } from "react";

//define logged in user
interface User {
  user_id: number;
  role: string;
  organisation_id: number;
  first_name?: string;
  last_name?: string;
  email?: string;
  organisation_name?: string;
}

//define what context provides - user, loading, login and logout (every component using the context will access these)
interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh_user: () => Promise<void>;
}

//no provider to start - therefore gets undefined
export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
);

export type { User, AuthContextValue };
