import { Navigate, Outlet, matchPath, useLocation } from "react-router-dom";
import { useAuthStore } from "@/features/auth/store/auth-store";
import { navigationItems } from "@/routes/navigation";

export const hasPermission = (userRoles: string[], allowedRoles?: string[]) => {
  if (!allowedRoles || allowedRoles.length === 0) return true;
  return allowedRoles.some((role) => userRoles.includes(role));
};

export function RoleGuard() {
  const { user } = useAuthStore();
  const location = useLocation();

  const userRoles: string[] = Array.isArray((user as any)?.roles)
    ? (user as any).roles
    : (user as any)?.role
      ? [(user as any).role]
      : [];

  const matchedItem = navigationItems.find((item) =>
    matchPath(
      {
        path: item.path,
        end: false,
      },
      location.pathname
    )
  );

  const allowedRoles = matchedItem?.roles;

  const isAllowed = hasPermission(userRoles, allowedRoles);

  if (!isAllowed) {
    return <Navigate to="/forbidden" replace />;
  }

  return <Outlet />;
}