import { NavLink } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  LogOut,
  RefreshCcw,
} from "lucide-react";
import { navigationItems } from "@/routes/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/features/auth/store/auth-store";
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet";
import logo from "@/assets/logo.png";
import { useIsMobile } from "@/app/hooks/useIsMobile";
import { useEffect } from "react";

type Props = {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
};

type SidebarContentProps = {
  collapsed: boolean;
  mobile?: boolean;
  onToggle: () => void;
  onNavigate?: () => void;
};

function SidebarContent({
  collapsed,
  mobile = false,
  onToggle,
  onNavigate,
}: SidebarContentProps) {
  const appName = "TÂM ĐỨC CƯỜNG";
  const logout = useAuthStore((state) => state.logout);

  

  const hideText = collapsed && !mobile;

  return (
    <div className="flex h-full flex-col">
      <div
        className={cn(
          "mb-8 flex items-center px-2",
          hideText ? "justify-center" : "gap-3"
        )}
      >
        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl border bg-primary/10 text-primary">
          <img
            src={logo}
            alt={appName}
            className="h-full w-full object-cover"
          />
        </div>

        <div
          className={cn(
            "grid overflow-hidden transition-all duration-300 ease-in-out",
            hideText ? "grid-cols-[0fr] opacity-0" : "grid-cols-[1fr] opacity-100"
          )}
        >
          <div className="min-w-0 whitespace-nowrap">
            <p className="truncate font-semibold">{appName}</p>
            <p className="truncate text-sm text-muted-foreground">
              Quản lý bán hàng
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto">
        {navigationItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              title={hideText ? item.label : undefined}
              onClick={onNavigate}
              className={({ isActive }) =>
                cn(
                  "flex items-center rounded-2xl py-3 text-sm font-medium transition-all duration-200 hover:bg-accent",
                  isActive && "bg-primary text-primary-foreground hover:bg-primary",
                  hideText ? "justify-center px-3" : "gap-3 px-4"
                )
              }
            >
              <Icon className="h-4 w-4 shrink-0" />

              <div
                className={cn(
                  "grid overflow-hidden transition-all duration-300 ease-in-out",
                  hideText ? "grid-cols-[0fr] opacity-0" : "grid-cols-[1fr] opacity-100"
                )}
              >
                <span className="min-w-0 whitespace-nowrap">{item.label}</span>
              </div>
            </NavLink>
          );
        })}
      </nav>

      {mobile && (
        <div className="mt-4 space-y-2 border-t pt-4">
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start gap-2 rounded-2xl"
            onClick={() => window.location.reload()}
          >
            <RefreshCcw className="h-4 w-4" />
            Tải lại trang
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 rounded-2xl"
            onClick={() => {
              logout();
              onNavigate?.();
            }}
          >
            <LogOut className="h-4 w-4" />
            Đăng xuất
          </Button>
        </div>
      )}

      {!mobile && (
        <div className="mt-4 border-t pt-4">
          <Button
            variant="outline"
            onClick={onToggle}
            title={collapsed ? "Mở rộng" : "Thu gọn"}
            className={cn(
              "w-full overflow-hidden transition-all duration-300 ease-in-out",
              collapsed ? "justify-center px-2" : "justify-between px-3"
            )}
          >
            <div
              className={cn(
                "grid overflow-hidden transition-all duration-300 ease-in-out",
                collapsed ? "grid-cols-[0fr] opacity-0" : "grid-cols-[1fr] opacity-100"
              )}
            >
              <span className="min-w-0 whitespace-nowrap">Thu gọn</span>
            </div>

            {collapsed ? (
              <ChevronRight className="h-4 w-4 shrink-0" />
            ) : (
              <ChevronLeft className="h-4 w-4 shrink-0" />
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

export function AppSidebar({
  collapsed,
  onToggle,
  mobileOpen = false,
  onMobileClose,
}: Props) {

  const isMobile = useIsMobile();

  useEffect(() => {
    if (!isMobile) {
      onMobileClose?.();
    }
  }, [isMobile]);

  if (isMobile) {
    return (
      <Sheet
        open={mobileOpen}
        onOpenChange={(open) => {
          if (!open) onMobileClose?.();
        }}
      >
        <SheetContent
          side="left"
          className="w-[280px] border-r bg-white p-4 sm:w-[320px]"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <SidebarContent
            collapsed={false}
            mobile
            onToggle={onToggle}
            onNavigate={onMobileClose}
          />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <>
      <aside
        className={cn(
          "hidden h-screen shrink-0 flex-col border-r bg-white/70 py-6 lg:flex",
          "transition-[width,padding] duration-300 ease-in-out",
          collapsed ? "w-20 px-2" : "w-72 px-4"
        )}
      >
        <SidebarContent collapsed={collapsed} onToggle={onToggle} />
      </aside>

      
    </>
  );
}