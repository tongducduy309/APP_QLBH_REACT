import { Menu } from "antd";
import { Bell, LogOut, MenuIcon, Search } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/features/auth/store/auth-store";
import { navigationItems } from "@/routes/navigation";
import { resolveSearchItemRoute } from "@/features/search/utils/search-route";
import { GlobalSearchDropdown } from "@/features/search/components/global-search-dropdown";
import { SearchSuggestion } from "@/types/search";
import { searchGlobal } from "@/services/search-api";

export function AppHeader() {
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);

  const navigate = useNavigate();
  const location = useLocation();


  const title = useMemo(() => {
    const found = navigationItems.find((item) =>
      location.pathname.startsWith(item.path)
    );

    return found?.label ?? "Quản lý bán hàng";
  }, [location.pathname]);

  const subtitle = useMemo(() => {
    const found = navigationItems.find((item) =>
      location.pathname.startsWith(item.path)
    );

    return found?.subtitle ?? "";
  }, [location.pathname]);

  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(false);
  const [results, setResults] = useState<SearchSuggestion[]>([]);

  const searchContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const trimmedKeyword = keyword.trim();

    if (!trimmedKeyword) {
      setResults([]);
      setLoading(false);
      setOpenDropdown(false);
      return;
    }

    const timer = window.setTimeout(async () => {
      try {
        setLoading(true);
        const data = await searchGlobal(trimmedKeyword, 8);
        setResults(data);
        setOpenDropdown(true);
      } catch (error) {
        console.error("Search global failed:", error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      window.clearTimeout(timer);
    };
  }, [keyword]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!searchContainerRef.current) return;

      if (!searchContainerRef.current.contains(event.target as Node)) {
        setOpenDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    setOpenDropdown(false);
  }, [location.pathname]);

  function handleSelectSuggestion(item: SearchSuggestion) {
    setKeyword("");
    setOpenDropdown(false);
    navigate(resolveSearchItemRoute(item));
  }

  return (
    <header className="relative z-30 border-b bg-white/70 px-4 py-4 backdrop-blur">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm text-muted-foreground">
              Xin chào, {user?.fullName || user?.username || "người dùng"}
            </p>
            <h1 className="truncate text-2xl font-semibold">{title}</h1>
            <p className="truncate text-sm text-muted-foreground">
              {subtitle}
            </p>
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-3 lg:max-w-2xl lg:flex-row lg:items-center lg:justify-end">
          <div
            ref={searchContainerRef}
            className="relative z-40 w-full lg:max-w-md"
          >
            <Search className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

            <Input
              value={keyword}
              onChange={(event) => {
                setKeyword(event.target.value);
                setOpenDropdown(true);
              }}
              onFocus={() => {
                if (keyword.trim()) {
                  setOpenDropdown(true);
                }
              }}
              className="pl-9"
              placeholder="Tìm kiếm hóa đơn, sản phẩm, khách hàng..."
            />

            <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50">
              <GlobalSearchDropdown
                keyword={keyword}
                loading={loading}
                open={openDropdown}
                results={results}
                onSelect={handleSelectSuggestion}
              />
            </div>
          </div>

          <Button variant="outline" size="sm" className="gap-2">
            <Bell className="h-4 w-4" />
            Thông báo
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="gap-2"
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
          items={navigationItems.map((item) => ({
            key: item.path,
            label: item.label,
          }))}
          onClick={({ key }) => navigate(key)}
        />
      </div>
    </header>
  );
}