import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

//has to be useAuth rather than use_auth (not recognosed by react as a hook otherwise)
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
