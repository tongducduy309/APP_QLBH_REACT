import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Loader2, ShieldCheck } from "lucide-react";
import { useAuthStore } from "@/features/auth/store/auth-store";

function AuthCheckingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-md rounded-2xl border bg-background p-8 shadow-lg">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <ShieldCheck className="h-8 w-8 text-primary" />
          </div>

          <div className="mb-3 flex items-center gap-2 text-primary">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm font-medium">Đang xác thực phiên đăng nhập</span>
          </div>

          <h2 className="text-xl font-semibold">Vui lòng chờ một chút</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Hệ thống đang kiểm tra thông tin đăng nhập của bạn để đảm bảo an toàn.
          </p>

          <div className="mt-6 h-2 w-full overflow-hidden rounded-full bg-muted">
            <div className="h-full w-1/2 animate-pulse rounded-full bg-primary" />
          </div>
        </div>
      </div>
    </div>
  );
}

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
    return <AuthCheckingScreen />;
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