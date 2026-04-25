import { useMemo } from "react";
import { useAuthStore } from "@/features/auth/store/auth-store";

export function usePermission() {
  const user = useAuthStore((state) => state.user);

  const userRoles: string[] = useMemo(() => {
    if (!user) return [];

    if (Array.isArray((user as any).roles)) {
      return (user as any).roles;
    }

    if ((user as any).role) {
      return [(user as any).role];
    }

    return [];
  }, [user]);

  const hasRole = (roles?: string[]) => {
    if (!roles || roles.length === 0) return true;
    return roles.some((r) => userRoles.includes(r));
  };

  return {
    userRoles,
    hasRole,
  };
}