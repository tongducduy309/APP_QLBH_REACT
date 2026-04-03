import { Menu } from "antd";
import { Bell, LogOut, MenuIcon, Search } from "lucide-react";
import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/features/auth/store/auth-store";
import { navigationItems } from "@/routes/navigation";

export function AppHeader() {
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  const location = useLocation();

  const title = useMemo(
    () => navigationItems.find((item) => item.path === location.pathname)?.label ?? "APP_QLBH React",
    [location.pathname],
  );

  return (
    <header className="border-b bg-white/70 px-4 py-4 backdrop-blur">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Xin chào, {user?.fullName}</p>
          <h1 className="text-2xl font-semibold">{title}</h1>
        </div>

        <div className="flex flex-1 flex-col gap-3 lg:max-w-2xl lg:flex-row lg:items-center lg:justify-end">
          <div className="relative w-full lg:max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-9" placeholder="Tìm kiếm đơn hàng, khách hàng, sản phẩm..." />
          </div>

          <Button variant="outline" size="sm">
            <Bell className="h-4 w-4" />
            Thông báo
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              logout();
              navigate("/login");
            }}
          >
            <LogOut className="h-4 w-4" />
            Đăng xuất
          </Button>
        </div>
      </div>

      <div className="mt-3 rounded-2xl border bg-slate-50 p-2 lg:hidden">
        <Menu
          mode="horizontal"
          overflowedIndicator={<MenuIcon className="h-4 w-4" />}
          selectedKeys={[location.pathname]}
          items={navigationItems.map((item) => ({ key: item.path, label: item.label }))}
          onClick={({ key }) => navigate(key)}
        />
      </div>
    </header>
  );
}
