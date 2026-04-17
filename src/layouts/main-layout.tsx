import { Outlet } from "react-router-dom";
import { AppHeader } from "@/components/layout/app-header";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { useEffect, useState } from "react";
import { cleanupExpiredOrderStorage } from "@/utils/order-storage-cleanup";

export function MainLayout() {
  const [collapsed, setCollapsed] = useState(false);
  useEffect(() => {
    const result = cleanupExpiredOrderStorage();

    if (result.removedKeys.length > 0) {
      console.log(
        "[order-storage] Đã xóa draft hết hạn:",
        result.removedKeys
      );
    }
  }, []);
  return (
    <div className="h-screen overflow-hidden bg-slate-50">
      <div className="flex h-full">
        <div className="shrink-0">
          <AppSidebar collapsed={collapsed} onToggle={() => setCollapsed((prev) => !prev)}/>
        </div>

        <div className="flex h-full min-w-0 flex-1 flex-col">
          <div className="shrink-0">
            <AppHeader />
          </div>

          <main className="min-h-0 flex-1 overflow-y-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}