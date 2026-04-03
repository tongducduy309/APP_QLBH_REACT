import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "@/features/auth/store/auth-store";
import { paths } from "@/routes/paths";

export function ProtectedRoute() {
  const token = useAuthStore((state) => state.token);
  const location = useLocation();

  if (!token) {
    return <Navigate to={paths.login} replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}

export function GuestRoute() {
  const token = useAuthStore((state) => state.token);

  if (token) {
    return <Navigate to={paths.dashboard} replace />;
  }

  return <Outlet />;
}
