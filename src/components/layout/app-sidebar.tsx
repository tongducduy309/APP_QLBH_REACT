import { NavLink } from "react-router-dom";
import { ChevronLeft, ChevronRight, Package2 } from "lucide-react";
import { navigationItems } from "@/routes/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useSettingsStore } from "@/features/settings/store/settings-store";

type Props = {
  collapsed: boolean;
  onToggle: () => void;
};

export function AppSidebar({ collapsed, onToggle }: Props) {
  const appName = "TÂM ĐỨC CƯỜNG";


  return (
    <aside
      className={cn(
        "hidden h-screen shrink-0 flex-col border-r bg-white/70 py-6 lg:flex",
        "transition-[width,padding] duration-300 ease-in-out",
        collapsed ? "w-20 px-2" : "w-72 px-4"
      )}
    >
      <div className="mb-8 flex items-center gap-3 px-2">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl border bg-primary/10 text-primary">
          <img
              src="/logo.png"
              alt={appName}
              className="h-full w-full object-cover"
            />
        </div>

        <div
          className={cn(
            "grid overflow-hidden transition-all duration-300 ease-in-out",
            collapsed ? "grid-cols-[0fr] opacity-0" : "grid-cols-[1fr] opacity-100"
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

      <nav className="flex-1 space-y-1">
        {navigationItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              title={collapsed ? item.label : undefined}
              className={({ isActive }) =>
                cn(
                  "flex items-center rounded-2xl py-3 text-sm font-medium transition-all duration-200 hover:bg-accent",
                  isActive && "bg-primary text-primary-foreground hover:bg-primary",
                  collapsed ? "justify-center px-3" : "gap-3 px-4"
                )
              }
            >
              <Icon className="h-4 w-4 shrink-0" />

              <div
                className={cn(
                  "grid overflow-hidden transition-all duration-300 ease-in-out",
                  collapsed ? "grid-cols-[0fr] opacity-0" : "grid-cols-[1fr] opacity-100"
                )}
              >
                <span className="min-w-0 whitespace-nowrap">{item.label}</span>
              </div>
            </NavLink>
          );
        })}
      </nav>

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
    </aside>
  );
}