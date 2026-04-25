import { NavLink } from "react-router-dom";
import {
  BadgeCheck,
  BriefcaseBusiness,
  Building2,
  ChevronLeft,
  ChevronRight,
  IdCard,
  LogOut,
  Mail,
  RefreshCcw,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { navigationItems } from "@/routes/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/features/auth/store/auth-store";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import logo from "@/assets/logo.png";
import { useIsMobile } from "@/app/hooks/useIsMobile";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

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
  onChangeSettingProfile: () => void;
};

function getUserRoles(user: any): string[] {
  if (Array.isArray(user?.roles)) return user.roles;
  if (user?.role) return [user.role];
  return [];
}

function SidebarContent({
  collapsed,
  mobile = false,
  onToggle,
  onNavigate,
  onChangeSettingProfile,
}: SidebarContentProps) {
  const appName = "TÂM ĐỨC CƯỜNG";
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);

  const roles = getUserRoles(user);

  const hasRole = (allowedRoles?: string[]) => {
    if (!allowedRoles || allowedRoles.length === 0) return true;
    return allowedRoles.some((role) => roles.includes(role));
  };

  const hideText = collapsed && !mobile;

  return (
    <div className="flex h-full flex-col">
      <button
        type="button"
        className={cn(
          "mb-8 flex items-center rounded-2xl px-2 py-1 text-left transition hover:bg-muted",
          hideText ? "justify-center" : "gap-3"
        )}
        onClick={onChangeSettingProfile}
      >
        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl border bg-primary/10 text-primary">
          <img src={logo} alt={appName} className="h-full w-full object-cover" />
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
      </button>

      <nav className="flex-1 space-y-1 overflow-y-auto">
        {navigationItems
          .filter((item) => hasRole(item.roles))
          .map((item) => {
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
                    isActive &&
                      "bg-primary text-primary-foreground hover:bg-primary",
                    hideText ? "justify-center px-3" : "gap-3 px-4"
                  )
                }
              >
                <Icon className="h-4 w-4 shrink-0" />

                <div
                  className={cn(
                    "grid overflow-hidden transition-all duration-300 ease-in-out",
                    hideText
                      ? "grid-cols-[0fr] opacity-0"
                      : "grid-cols-[1fr] opacity-100"
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
            className="w-full justify-start gap-2 rounded-2xl text-red-500 hover:bg-red-50 hover:text-red-600"
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
                collapsed
                  ? "grid-cols-[0fr] opacity-0"
                  : "grid-cols-[1fr] opacity-100"
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

function ProfileInfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string | number | null;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl px-2 py-2 transition hover:bg-muted/60">
      <div className="mt-0.5 text-muted-foreground">{icon}</div>

      <div className="min-w-0 flex-1">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="truncate text-sm font-medium text-foreground">
          {value || "Chưa cập nhật"}
        </div>
      </div>
    </div>
  );
}

function ProfileCard({ onClose }: { onClose: () => void }) {
  const user = useAuthStore((state) => state.user);


  const logout = useAuthStore((state) => state.logout);

  const roles = getUserRoles(user);
  const displayName = (user as any)?.fullName || (user as any)?.username || "Người dùng";
  const email = (user as any)?.email || "Chưa có email";
  const fallback = displayName.charAt(0).toUpperCase();

  return (
    <Card className="w-[320px] overflow-hidden rounded-2xl border pt-0 shadow-xl">
      <CardContent className="p-0">
        <div className="bg-gradient-to-r from-slate-950 to-slate-700 px-5 py-5 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/15 text-lg font-bold ring-1 ring-white/20">
              {fallback}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-base font-semibold">{displayName}</p>
              <p className="truncate text-xs text-white/75">{user?.code}</p>

              {roles.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {roles.map((role) => (
                    <span
                      key={role}
                      className="rounded-full bg-white/15 px-2 py-0.5 text-[11px] font-medium text-white"
                    >
                      {role}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold text-foreground">
              Thông tin cá nhân
            </p>

          </div>

          <div className="space-y-1">
            <ProfileInfoRow
              icon={<IdCard className="h-4 w-4" />}
              label="Tài khoản"
              value={(user as any)?.username}
            />

            <ProfileInfoRow
              icon={<Mail className="h-4 w-4" />}
              label="Email"
              value={email}
            />

            {/* <ProfileInfoRow
              icon={<Building2 className="h-4 w-4" />}
              label="Phòng ban"
              value={(user as any)?.departmentName || "Bán hàng"}
            /> */}

            <ProfileInfoRow
              icon={<BriefcaseBusiness className="h-4 w-4" />}
              label="Chức vụ"
              value={(user as any)?.position}
            />

            {/* <ProfileInfoRow
              icon={<BadgeCheck className="h-4 w-4" />}
              label="Trạng thái"
              value={(user as any)?.enabled === false ? "Đã khóa" : "Đang hoạt động"}
            /> */}
          </div>

          <Separator className="my-4" />

          <div className="flex flex-col gap-2">
            <Button
              variant="outline"
              size="sm"
              className="justify-start gap-2 rounded-xl"
              onClick={() => window.location.reload()}
            >
              <RefreshCcw className="h-4 w-4" />
              Tải lại trang
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="justify-start gap-2 rounded-xl text-red-500 hover:bg-red-50 hover:text-red-600"
              onClick={() => {
                logout();
                onClose();
              }}
            >
              <LogOut className="h-4 w-4" />
              Đăng xuất
            </Button>
          </div>

          <p className="mt-3 text-xs leading-5 text-muted-foreground">
            Thông tin này dùng để nhận diện tài khoản trong hệ thống quản lý bán
            hàng.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export function AppSidebar({
  collapsed,
  onToggle,
  mobileOpen = false,
  onMobileClose,
}: Props) {
  const isMobile = useIsMobile();
  const [openSettingProfile, setOpenSettingProfile] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isMobile) {
      onMobileClose?.();
    }
  }, [isMobile, onMobileClose]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!openSettingProfile) return;

      const target = event.target as Node;

      if (cardRef.current && !cardRef.current.contains(target)) {
        setOpenSettingProfile(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openSettingProfile]);

  if (isMobile) {
    return (
      <>
        <Sheet
          open={mobileOpen}
          onOpenChange={(open) => {
            if (!open) onMobileClose?.();
          }}
        >
          <SheetContent
            side="left"
            className="w-[280px] border-r bg-white p-4 sm:w-[320px]"
            onOpenAutoFocus={(event) => event.preventDefault()}
          >
            <SidebarContent
              collapsed={false}
              mobile
              onToggle={onToggle}
              onChangeSettingProfile={() =>
                setOpenSettingProfile((prev) => !prev)
              }
              onNavigate={onMobileClose}
            />
          </SheetContent>
        </Sheet>

        {openSettingProfile && (
          <div
            ref={cardRef}
            className="fixed left-4 top-4 z-50 animate-in fade-in zoom-in-95"
          >
            <ProfileCard onClose={() => setOpenSettingProfile(false)} />
          </div>
        )}
      </>
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
        <SidebarContent
          collapsed={collapsed}
          onToggle={onToggle}
          onChangeSettingProfile={() =>
            setOpenSettingProfile((prev) => !prev)
          }
        />
      </aside>

      {openSettingProfile && (
        <div
          ref={cardRef}
          className={cn(
            "fixed top-4 z-50 animate-in fade-in zoom-in-95",
            collapsed ? "left-[84px]" : "left-[296px]"
          )}
        >
          <ProfileCard onClose={() => setOpenSettingProfile(false)} />
        </div>
      )}
    </>
  );
}