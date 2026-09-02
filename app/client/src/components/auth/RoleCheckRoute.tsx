// Assumes this route is always nested inside RestrictedRoute, so the user
// is guaranteed non-null here. The 'user &&' guard exists only to satisfy TypeScript —
// an unauthenticated user should never reach this component.

import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

// allowed_roles: roles permitted to view the nested route
// redirect_to: where to send users whose role isn't in allowed_roles
interface RoleCheckRouteProps {
  allowed_roles: string[];
  redirect_to: string;
}

const RoleCheckRoute = ({
  allowed_roles,
  redirect_to,
}: RoleCheckRouteProps) => {
  const { user } = useAuth();

  if (user && !allowed_roles.includes(user.role)) {
    return <Navigate to={redirect_to} replace />;
  }

  return <Outlet />;
};

export default RoleCheckRoute;
