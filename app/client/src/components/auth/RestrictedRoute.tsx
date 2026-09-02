// Route guard: blocks access to nested routes until auth state resolves,
// redirects to /login if no authenticated user is found

import { useAuth } from "../../hooks/useAuth";
import { Navigate, Outlet } from "react-router-dom";

const RestrictedRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-placeholder-text">
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return <Outlet />;
};

export default RestrictedRoute;
