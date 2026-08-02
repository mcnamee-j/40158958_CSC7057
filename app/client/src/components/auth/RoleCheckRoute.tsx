import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

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
