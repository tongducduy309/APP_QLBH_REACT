import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "@/features/auth/store/auth-store";

export function ProtectedRoute() {
  const location = useLocation();
  const accessToken = useAuthStore((state) => state.accessToken);
  const verifyToken = useAuthStore((state) => state.verifyToken);

  const [verified, setVerified] = useState<boolean | null>(null);

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      if (!accessToken) {
        if (mounted) setVerified(false);
        return;
      }

      const ok = await verifyToken();
      if (mounted) setVerified(ok);
    };

    run();

    return () => {
      mounted = false;
    };
  }, [accessToken, verifyToken]);

  if (verified === null) {
    return <div className="p-4">Đang kiểm tra phiên đăng nhập...</div>;
  }

  if (!verified) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}

export function GuestRoute() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (isAuthenticated) {
    return <Navigate to="/sales" replace />;
  }

  return <Outlet />;
}