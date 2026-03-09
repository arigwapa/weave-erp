import { Navigate, Outlet, useLocation } from "react-router-dom";
import { getRoleFromToken, isAuthenticated, type AppRole } from "./authToken";

type ProtectedRouteProps = {
  allowedRoles?: AppRole[];
};

export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const location = useLocation();

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!allowedRoles || allowedRoles.length === 0) {
    return <Outlet />;
  }

  const currentRole = getRoleFromToken();
  if (!currentRole || !allowedRoles.includes(currentRole)) {
    return <Navigate to="/unauthorized" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
