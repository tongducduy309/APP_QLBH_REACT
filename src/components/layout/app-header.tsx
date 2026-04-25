import { LogOut, Menu, RefreshCcw, ScanBarcode, Search } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/features/auth/store/auth-store";
import { navigationItems } from "@/routes/navigation";
import { resolveSearchItemRoute } from "@/features/search/utils/search-route";
import { GlobalSearchDropdown } from "@/features/search/components/global-search-dropdown";
import type { SearchSuggestion } from "@/types/search";
import { searchGlobal } from "@/services/search-api";
import { BarcodeScanDialog } from "../common/barcode-scan-dialog";

type Props = {
  onOpenMobileMenu?: () => void;
};

export function AppHeader({ onOpenMobileMenu }: Props) {
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);

  const navigate = useNavigate();
  const location = useLocation();

  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(false);
  const [results, setResults] = useState<SearchSuggestion[]>([]);
  const [openBarcodeDialog, setOpenBarcodeDialog] = useState(false);

  const searchContainerRef = useRef<HTMLDivElement | null>(null);

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

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <header className="relative z-30 border-b bg-white/70 px-3 py-3 backdrop-blur sm:px-4 sm:py-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between lg:gap-4">
        <div className="flex items-start gap-3 lg:items-center">
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 shrink-0 lg:hidden"
            onClick={onOpenMobileMenu}
          >
            <Menu className="h-4 w-4" />
          </Button>

          <div className="min-w-0 flex-1">
            <p className="truncate text-xs text-muted-foreground sm:text-sm">
              Xin chào, {user?.fullName || user?.username || "người dùng"}
            </p>

            <h1 className="truncate text-lg font-semibold sm:text-2xl">
              {title}
            </h1>

            <p className="truncate text-xs text-muted-foreground sm:text-sm">
              {subtitle}
            </p>
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-2 lg:max-w-2xl lg:flex-row lg:items-center lg:justify-end lg:gap-3">
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
              onKeyDown={(event) => {
                if (event.key === "Enter" && keyword.trim()) {
                  setOpenDropdown(true);
                }
              }}
              className="h-10 pl-9 pr-16 text-sm lg:h-10 lg:text-sm"
              placeholder="Tìm kiếm hóa đơn, sản phẩm, khách hàng..."
            />

            {/* Nút clear */}
            {keyword && (
              <button
                type="button"
                onClick={() => {
                  setKeyword("");
                  setOpenDropdown(false);
                }}
                className="absolute right-9 top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:bg-slate-100 hover:text-slate-900"
              >
                ✕
              </button>
            )}

            {/* Nút barcode */}
            <button
              type="button"
              onClick={() => setOpenBarcodeDialog(true)}
              className="absolute right-2 top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:bg-slate-100 hover:text-slate-900"
              title="Quét mã vạch"
            >
              <ScanBarcode className="h-4 w-4" />
            </button>

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

          {/* <div className="hidden lg:flex lg:w-auto lg:items-center lg:gap-3">
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => window.location.reload()}
            >
              <RefreshCcw className="h-4 w-4" />
              <span className="truncate">Tải lại trang</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="gap-2"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              <span className="truncate">Đăng xuất</span>
            </Button>
          </div> */}
        </div>
      </div>
      <BarcodeScanDialog
        open={openBarcodeDialog}
        onOpenChange={setOpenBarcodeDialog}
        onScan={(barcode) => {
          setKeyword(barcode);
          setOpenDropdown(true);
        }}
      />
    </header>
  );
}