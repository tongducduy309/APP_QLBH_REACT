import { NavLink } from "react-router-dom";
import { Package2 } from "lucide-react";
import { navigationItems } from "@/routes/navigation";
import { cn } from "@/lib/utils";

export function AppSidebar() {
  return (
    <aside className="hidden w-72 shrink-0 border-r bg-white/70 px-4 py-6 lg:block">
      <div className="mb-8 flex items-center gap-3 px-2">
        <div className="rounded-2xl bg-primary p-3 text-primary-foreground">
          <Package2 className="h-5 w-5" />
        </div>
        <div>
          <p className="font-semibold">TÂM ĐỨC CƯỜNG</p>
          <p className="text-sm text-muted-foreground">Quản lý bán hàng</p>
        </div>
      </div>

      <nav className="space-y-1">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition hover:bg-accent",
                  isActive && "bg-primary text-primary-foreground hover:bg-primary",
                )
              }
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
