from pathlib import Path

root = Path('/mnt/data/app-qlbh-react')
files = {
    'package.json': r'''{
  "name": "app-qlbh-react",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "engines": {
    "node": "24.14.0"
  },
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx --max-warnings 0"
  },
  "dependencies": {
    "@hookform/resolvers": "^3.12.0",
    "@radix-ui/react-dialog": "^1.1.15",
    "@radix-ui/react-slot": "^1.2.3",
    "@tanstack/react-query": "^5.90.5",
    "antd": "^5.27.5",
    "axios": "^1.12.2",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "date-fns": "^4.1.0",
    "lucide-react": "^0.542.0",
    "react": "^19.1.1",
    "react-dom": "^19.1.1",
    "react-hook-form": "^7.62.0",
    "react-router-dom": "^7.8.2",
    "recharts": "^3.1.2",
    "sonner": "^2.0.7",
    "tailwind-merge": "^3.3.1",
    "zod": "^4.1.5",
    "zustand": "^5.0.8"
  },
  "devDependencies": {
    "@eslint/js": "^9.34.0",
    "@types/node": "^24.3.1",
    "@types/react": "^19.1.10",
    "@types/react-dom": "^19.1.7",
    "@vitejs/plugin-react": "^5.0.2",
    "autoprefixer": "^10.4.21",
    "eslint": "^9.34.0",
    "eslint-plugin-react-hooks": "^5.2.0",
    "eslint-plugin-react-refresh": "^0.4.20",
    "globals": "^16.3.0",
    "postcss": "^8.5.6",
    "tailwindcss": "^3.4.17",
    "typescript": "^5.9.2",
    "typescript-eslint": "^8.41.0",
    "vite": "^7.1.3"
  }
}
''',
    'tsconfig.json': r'''{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ]
}
''',
    'tsconfig.app.json': r'''{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    },
    "moduleResolution": "Bundler",
    "allowImportingTsExtensions": false,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"]
}
''',
    'tsconfig.node.json': r'''{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
''',
    'vite.config.ts': r'''import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3000,
  },
});
''',
    'postcss.config.js': r'''export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
''',
    'tailwind.config.ts': r'''import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: "hsl(var(--card))",
        "card-foreground": "hsl(var(--card-foreground))",
        popover: "hsl(var(--popover))",
        "popover-foreground": "hsl(var(--popover-foreground))",
        primary: "hsl(var(--primary))",
        "primary-foreground": "hsl(var(--primary-foreground))",
        secondary: "hsl(var(--secondary))",
        "secondary-foreground": "hsl(var(--secondary-foreground))",
        muted: "hsl(var(--muted))",
        "muted-foreground": "hsl(var(--muted-foreground))",
        accent: "hsl(var(--accent))",
        "accent-foreground": "hsl(var(--accent-foreground))",
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [],
} satisfies Config;
''',
    'index.html': r'''<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>APP_QLBH React</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
''',
    '.gitignore': r'''node_modules
dist
.vscode
.DS_Store
.env
''',
    'README.md': r'''# APP_QLBH React

Bản React hoá từ repo Angular `APP_QLBH`.

## Công nghệ
- React 19
- Vite 7
- TypeScript 5
- Node.js **24.14.0**
- Tailwind CSS
- shadcn/ui style components
- Ant Design
- Zustand
- TanStack Query
- React Hook Form + Zod

## Chức năng đã dựng
- Đăng nhập
- Dashboard
- Quản lý bán hàng
- Quản lý hàng hóa
- Quản lý khách hàng
- Lịch sử giao dịch
- Báo cáo thuế
- Bảng báo giá
- Thống kê
- Phiếu nhập
- Quét mã vạch
- Cài đặt
- Protected routes
- Responsive layout

## Chạy dự án
```bash
nvm use 24.14.0
npm install
npm run dev
```

Mặc định Vite chạy tại `http://localhost:3000`.

## Tài khoản demo
- User: `admin`
- Password: `123456`

## Cấu trúc
```txt
src/
  app/
  components/
  features/
  layouts/
  lib/
  routes/
  styles/
```

## Ghi chú
- Dự án này tập trung vào việc **chuyển kiến trúc Angular sang React** và dựng sẵn UI/flow để bạn có thể chạy ngay.
- `src/lib/axios.ts` đã sẵn sàng để nối backend thật.
- Dữ liệu hiện dùng mock ở `src/lib/mock-data.ts` để dự án chạy độc lập.
''',
    'eslint.config.js': r'''import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
    },
  },
);
''',
    'src/main.tsx': r'''import React from "react";
import ReactDOM from "react-dom/client";
import { ConfigProvider, theme } from "antd";
import { AppProvider } from "@/app/providers/app-provider";
import "antd/dist/reset.css";
import "@/styles/globals.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ConfigProvider
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: {
          borderRadius: 14,
          colorPrimary: "#0f172a",
        },
      }}
    >
      <AppProvider />
    </ConfigProvider>
  </React.StrictMode>,
);
''',
    'src/styles/globals.css': r'''@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --card: 0 0% 100%;
  --card-foreground: 222.2 84% 4.9%;
  --popover: 0 0% 100%;
  --popover-foreground: 222.2 84% 4.9%;
  --primary: 222.2 47.4% 11.2%;
  --primary-foreground: 210 40% 98%;
  --secondary: 210 40% 96.1%;
  --secondary-foreground: 222.2 47.4% 11.2%;
  --muted: 210 40% 96.1%;
  --muted-foreground: 215.4 16.3% 46.9%;
  --accent: 210 40% 96.1%;
  --accent-foreground: 222.2 47.4% 11.2%;
  --border: 214.3 31.8% 91.4%;
  --input: 214.3 31.8% 91.4%;
  --ring: 222.2 84% 4.9%;
  --radius: 1rem;
}

* {
  @apply border-border;
}

body {
  @apply bg-background text-foreground antialiased;
  font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

#root {
  min-height: 100vh;
}
''',
    'src/lib/utils.ts': r'''import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
}
''',
    'src/lib/mock-data.ts': r'''export type Product = {
  id: number;
  sku: string;
  name: string;
  category: string;
  stock: number;
  price: number;
  status: "Còn hàng" | "Sắp hết" | "Hết hàng";
};

export type Customer = {
  id: number;
  name: string;
  phone: string;
  email: string;
  tier: "Silver" | "Gold" | "VIP";
  debt: number;
};

export type Transaction = {
  id: string;
  customer: string;
  total: number;
  channel: "Tại quầy" | "Online";
  createdAt: string;
  status: "Hoàn thành" | "Chờ xử lý" | "Đã huỷ";
};

export const dashboardStats = [
  { label: "Doanh thu hôm nay", value: "32.500.000đ" },
  { label: "Đơn hàng", value: "128" },
  { label: "Khách hàng mới", value: "16" },
  { label: "Sản phẩm sắp hết", value: "9" },
];

export const products: Product[] = [
  { id: 1, sku: "SP001", name: "Laptop Asus VivoBook", category: "Laptop", stock: 18, price: 16500000, status: "Còn hàng" },
  { id: 2, sku: "SP002", name: "Chuột Logitech M331", category: "Phụ kiện", stock: 6, price: 320000, status: "Sắp hết" },
  { id: 3, sku: "SP003", name: "Màn hình Dell 24 inch", category: "Màn hình", stock: 0, price: 2890000, status: "Hết hàng" },
  { id: 4, sku: "SP004", name: "Bàn phím cơ Keychron", category: "Phụ kiện", stock: 11, price: 1790000, status: "Còn hàng" },
];

export const customers: Customer[] = [
  { id: 1, name: "Nguyễn Văn An", phone: "0912345678", email: "an@gmail.com", tier: "VIP", debt: 0 },
  { id: 2, name: "Trần Thị Bình", phone: "0987654321", email: "binh@gmail.com", tier: "Gold", debt: 1200000 },
  { id: 3, name: "Lê Quang Huy", phone: "0908123123", email: "huy@gmail.com", tier: "Silver", debt: 0 },
];

export const transactions: Transaction[] = [
  { id: "HD001", customer: "Nguyễn Văn An", total: 3850000, channel: "Tại quầy", createdAt: "2026-03-31 09:10", status: "Hoàn thành" },
  { id: "HD002", customer: "Trần Thị Bình", total: 1250000, channel: "Online", createdAt: "2026-03-31 12:45", status: "Chờ xử lý" },
  { id: "HD003", customer: "Lê Quang Huy", total: 18900000, channel: "Tại quầy", createdAt: "2026-03-30 17:00", status: "Hoàn thành" },
];

export const revenueTrend = [
  { name: "T2", revenue: 12000000 },
  { name: "T3", revenue: 18000000 },
  { name: "T4", revenue: 15500000 },
  { name: "T5", revenue: 22000000 },
  { name: "T6", revenue: 26500000 },
  { name: "T7", revenue: 20500000 },
  { name: "CN", revenue: 32500000 },
];
''',
    'src/lib/axios.ts': r'''import axios from "axios";
import { useAuthStore } from "@/features/auth/store/auth-store";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api",
  timeout: 15000,
});

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  },
);
''',
    'src/app/providers/app-provider.tsx': r'''import { RouterProvider } from "react-router-dom";
import { Toaster } from "sonner";
import { QueryProvider } from "@/app/providers/query-provider";
import { router } from "@/app/router";

export function AppProvider() {
  return (
    <QueryProvider>
      <RouterProvider router={router} />
      <Toaster richColors position="top-right" />
    </QueryProvider>
  );
}
''',
    'src/app/providers/query-provider.tsx': r'''import { PropsWithChildren, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export function QueryProvider({ children }: PropsWithChildren) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
''',
    'src/routes/paths.ts': r'''export const paths = {
  login: "/login",
  dashboard: "/",
  sales: "/sales",
  inventory: "/inventory",
  customers: "/customers",
  transactions: "/transactions",
  taxReport: "/reports/tax",
  quoteReport: "/reports/quotes",
  statistics: "/statistics",
  barcode: "/barcode",
  purchaseReceipts: "/purchase-receipts",
  settings: "/settings",
  forbidden: "/forbidden",
};
''',
    'src/routes/navigation.ts': r'''import { BarChart3, Boxes, FileSpreadsheet, FileText, LayoutDashboard, Receipt, ScanBarcode, Settings, ShoppingCart, Users } from "lucide-react";
import { paths } from "@/routes/paths";

export const navigationItems = [
  { label: "Tổng quan", path: paths.dashboard, icon: LayoutDashboard },
  { label: "Bán hàng", path: paths.sales, icon: ShoppingCart },
  { label: "Hàng hóa", path: paths.inventory, icon: Boxes },
  { label: "Khách hàng", path: paths.customers, icon: Users },
  { label: "Giao dịch", path: paths.transactions, icon: Receipt },
  { label: "Báo cáo thuế", path: paths.taxReport, icon: FileText },
  { label: "Bảng báo giá", path: paths.quoteReport, icon: FileSpreadsheet },
  { label: "Thống kê", path: paths.statistics, icon: BarChart3 },
  { label: "Quét mã vạch", path: paths.barcode, icon: ScanBarcode },
  { label: "Phiếu nhập", path: paths.purchaseReceipts, icon: Receipt },
  { label: "Cài đặt", path: paths.settings, icon: Settings },
] as const;
''',
    'src/features/auth/store/auth-store.ts': r'''import { create } from "zustand";

type User = {
  username: string;
  fullName: string;
  role: string;
};

type AuthState = {
  token: string | null;
  user: User | null;
  login: (payload: { username: string; password: string }) => Promise<void>;
  logout: () => void;
};

const storedToken = localStorage.getItem("qlbh_token");
const storedUser = localStorage.getItem("qlbh_user");

export const useAuthStore = create<AuthState>((set) => ({
  token: storedToken,
  user: storedUser ? JSON.parse(storedUser) as User : null,
  async login(payload) {
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (payload.username !== "admin" || payload.password !== "123456") {
      throw new Error("Sai tài khoản hoặc mật khẩu");
    }

    const token = "demo-token";
    const user = {
      username: "admin",
      fullName: "Quản trị viên",
      role: "ADMIN",
    };

    localStorage.setItem("qlbh_token", token);
    localStorage.setItem("qlbh_user", JSON.stringify(user));
    set({ token, user });
  },
  logout() {
    localStorage.removeItem("qlbh_token");
    localStorage.removeItem("qlbh_user");
    set({ token: null, user: null });
  },
}));
''',
    'src/app/router/guards.tsx': r'''import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "@/features/auth/store/auth-store";
import { paths } from "@/routes/paths";

export function ProtectedRoute() {
  const token = useAuthStore((state) => state.token);
  const location = useLocation();

  if (!token) {
    return <Navigate to={paths.login} replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}

export function GuestRoute() {
  const token = useAuthStore((state) => state.token);

  if (token) {
    return <Navigate to={paths.dashboard} replace />;
  }

  return <Outlet />;
}
''',
    'src/components/ui/button.tsx': r'''import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:opacity-90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        ghost: "hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-xl px-3",
        lg: "h-11 rounded-2xl px-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
''',
    'src/components/ui/card.tsx': r'''import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-3xl border bg-card text-card-foreground shadow-sm", className)} {...props} />;
}

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />;
}

export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("text-xl font-semibold leading-none tracking-tight", className)} {...props} />;
}

export function CardDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm text-muted-foreground", className)} {...props} />;
}

export function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-6 pt-0", className)} {...props} />;
}
''',
    'src/components/ui/input.tsx': r'''import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-2xl border border-input bg-background px-4 py-2 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";
''',
    'src/components/ui/badge.tsx': r'''import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground",
        className,
      )}
      {...props}
    />
  );
}
''',
    'src/components/layout/app-sidebar.tsx': r'''import { NavLink } from "react-router-dom";
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
          <p className="font-semibold">APP_QLBH React</p>
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
''',
    'src/components/layout/app-header.tsx': r'''import { Menu } from "antd";
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
''',
    'src/components/layout/page-shell.tsx': r'''import { PropsWithChildren } from "react";

export function PageShell({ children }: PropsWithChildren) {
  return <div className="space-y-6 p-4 lg:p-6">{children}</div>;
}
''',
    'src/layouts/main-layout.tsx': r'''import { Outlet } from "react-router-dom";
import { AppHeader } from "@/components/layout/app-header";
import { AppSidebar } from "@/components/layout/app-sidebar";

export function MainLayout() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex min-h-screen">
        <AppSidebar />
        <div className="flex min-h-screen flex-1 flex-col">
          <AppHeader />
          <main className="flex-1">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
''',
    'src/layouts/auth-layout.tsx': r'''import { Outlet } from "react-router-dom";

export function AuthLayout() {
  return (
    <div className="grid min-h-screen bg-slate-950 lg:grid-cols-2">
      <div className="hidden flex-col justify-between bg-slate-900 p-10 text-white lg:flex">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-slate-400">APP_QLBH</p>
          <h1 className="mt-4 max-w-lg text-4xl font-semibold leading-tight">
            Chuyển đổi Angular sang React với UI hiện đại từ shadcn và Ant Design.
          </h1>
        </div>
        <p className="max-w-md text-sm text-slate-400">
          Bản dựng này tập trung vào trải nghiệm vận hành bán hàng, quản lý hàng hóa, khách hàng và giao dịch.
        </p>
      </div>
      <div className="flex items-center justify-center p-6 lg:p-10">
        <Outlet />
      </div>
    </div>
  );
}
''',
    'src/features/auth/pages/login-page.tsx': r'''import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, LockKeyhole, UserRound } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/features/auth/store/auth-store";

const loginSchema = z.object({
  username: z.string().min(1, "Vui lòng nhập tài khoản"),
  password: z.string().min(1, "Vui lòng nhập mật khẩu"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginPage() {
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const from = (location.state as { from?: string } | null)?.from || "/";

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "admin",
      password: "123456",
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    try {
      setLoading(true);
      await login(values);
      toast.success("Đăng nhập thành công");
      navigate(from, { replace: true });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Đăng nhập thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md border-0 shadow-2xl">
      <CardHeader>
        <CardTitle className="text-3xl">Đăng nhập hệ thống</CardTitle>
        <CardDescription>Dùng tài khoản demo để trải nghiệm nhanh giao diện đã chuyển sang React.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <label className="text-sm font-medium">Tài khoản</label>
            <div className="relative">
              <UserRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input className="pl-9" {...form.register("username")} />
            </div>
            <p className="text-sm text-red-500">{form.formState.errors.username?.message}</p>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Mật khẩu</label>
            <div className="relative">
              <LockKeyhole className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input type="password" className="pl-9" {...form.register("password")} />
            </div>
            <p className="text-sm text-red-500">{form.formState.errors.password?.message}</p>
          </div>
          <Button className="w-full" type="submit" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Đăng nhập
          </Button>
          <div className="rounded-2xl bg-slate-50 p-4 text-sm text-muted-foreground">
            Demo: <strong>admin / 123456</strong>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
''',
    'src/features/dashboard/pages/dashboard-page.tsx': r'''import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageShell } from "@/components/layout/page-shell";
import { dashboardStats, revenueTrend, transactions } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";
import { Column, ColumnChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function DashboardPage() {
  return (
    <PageShell>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {dashboardStats.map((item) => (
          <Card key={item.label}>
            <CardHeader>
              <CardDescription>{item.label}</CardDescription>
              <CardTitle>{item.value}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[2fr,1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Xu hướng doanh thu 7 ngày</CardTitle>
            <CardDescription>Biểu đồ doanh thu tổng hợp theo ngày</CardDescription>
          </CardHeader>
          <CardContent className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <ColumnChart data={revenueTrend}>
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => `${Number(value) / 1000000}tr`} />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Column dataKey="revenue" radius={[10, 10, 0, 0]} />
              </ColumnChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Giao dịch gần đây</CardTitle>
            <CardDescription>3 hóa đơn mới nhất</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {transactions.map((item) => (
              <div key={item.id} className="rounded-2xl border p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-medium">{item.id}</p>
                    <p className="text-sm text-muted-foreground">{item.customer}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatCurrency(item.total)}</p>
                    <p className="text-sm text-muted-foreground">{item.createdAt}</p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </PageShell>
  );
}
''',
    'src/features/sales/pages/sales-page.tsx': r'''import { Segmented, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useMemo, useState } from "react";
import { PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { products, type Product } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";

const columns: ColumnsType<Product> = [
  { title: "Mã", dataIndex: "sku", key: "sku" },
  { title: "Tên sản phẩm", dataIndex: "name", key: "name" },
  { title: "Danh mục", dataIndex: "category", key: "category" },
  { title: "Tồn kho", dataIndex: "stock", key: "stock" },
  {
    title: "Giá bán",
    dataIndex: "price",
    key: "price",
    render: (value: number) => formatCurrency(value),
  },
  {
    title: "Trạng thái",
    dataIndex: "status",
    key: "status",
    render: (status: Product["status"]) => {
      const color = status === "Còn hàng" ? "green" : status === "Sắp hết" ? "orange" : "red";
      return <Tag color={color}>{status}</Tag>;
    },
  },
];

export function SalesPage() {
  const [tab, setTab] = useState("Tất cả");

  const filteredData = useMemo(() => {
    if (tab === "Tất cả") return products;
    return products.filter((item) => item.status === tab);
  }, [tab]);

  return (
    <PageShell>
      <div className="grid gap-6 xl:grid-cols-[1.2fr,0.8fr]">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
            <div>
              <CardTitle>Quầy bán hàng</CardTitle>
              <CardDescription>Mô phỏng giao diện chọn sản phẩm và tạo hóa đơn</CardDescription>
            </div>
            <Segmented
              options={["Tất cả", "Còn hàng", "Sắp hết", "Hết hàng"]}
              value={tab}
              onChange={(value) => setTab(String(value))}
            />
          </CardHeader>
          <CardContent>
            <Table<Product>
              rowKey="id"
              columns={columns}
              dataSource={filteredData}
              pagination={{ pageSize: 5 }}
              scroll={{ x: 900 }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Đơn hàng đang tạo</CardTitle>
            <CardDescription>Giữ nguyên định hướng logic từ module bán hàng Angular</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {products.slice(0, 2).map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-2xl border p-4">
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-muted-foreground">1 x {formatCurrency(item.price)}</p>
                </div>
                <p className="font-semibold">{formatCurrency(item.price)}</p>
              </div>
            ))}
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-muted-foreground">Tạm tính</span>
                <span className="font-semibold">{formatCurrency(products[0].price + products[1].price)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Khuyến mãi</span>
                <span className="font-semibold">0đ</span>
              </div>
            </div>
            <Button className="w-full">Thanh toán</Button>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
''',
    'src/features/inventory/pages/inventory-page.tsx': r'''import { Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { PageShell } from "@/components/layout/page-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { products, type Product } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";

const columns: ColumnsType<Product> = [
  { title: "SKU", dataIndex: "sku", key: "sku" },
  { title: "Tên sản phẩm", dataIndex: "name", key: "name" },
  { title: "Danh mục", dataIndex: "category", key: "category" },
  { title: "Tồn kho", dataIndex: "stock", key: "stock" },
  { title: "Giá", dataIndex: "price", key: "price", render: (value: number) => formatCurrency(value) },
  { title: "Trạng thái", dataIndex: "status", key: "status", render: (status) => <Tag>{status}</Tag> },
];

export function InventoryPage() {
  return (
    <PageShell>
      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardHeader><CardDescription>Tổng mặt hàng</CardDescription><CardTitle>1.248</CardTitle></CardHeader></Card>
        <Card><CardHeader><CardDescription>Sắp hết hàng</CardDescription><CardTitle>27</CardTitle></CardHeader></Card>
        <Card><CardHeader><CardDescription>Kho đang cảnh báo</CardDescription><CardTitle>03</CardTitle></CardHeader></Card>
      </div>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Danh sách hàng hóa</CardTitle>
            <CardDescription>Dùng Ant Design Table cho nghiệp vụ dữ liệu lớn</CardDescription>
          </div>
          <Badge>React + antd</Badge>
        </CardHeader>
        <CardContent>
          <Table<Product> rowKey="id" columns={columns} dataSource={products} pagination={{ pageSize: 6 }} scroll={{ x: 900 }} />
        </CardContent>
      </Card>
    </PageShell>
  );
}
''',
    'src/features/customers/pages/customers-page.tsx': r'''import { Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { PageShell } from "@/components/layout/page-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { customers, type Customer } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";

const columns: ColumnsType<Customer> = [
  { title: "Tên khách hàng", dataIndex: "name", key: "name" },
  { title: "Điện thoại", dataIndex: "phone", key: "phone" },
  { title: "Email", dataIndex: "email", key: "email" },
  { title: "Hạng", dataIndex: "tier", key: "tier", render: (tier) => <Tag color="blue">{tier}</Tag> },
  { title: "Công nợ", dataIndex: "debt", key: "debt", render: (value: number) => formatCurrency(value) },
];

export function CustomersPage() {
  return (
    <PageShell>
      <Card>
        <CardHeader>
          <CardTitle>Quản lý khách hàng</CardTitle>
          <CardDescription>Danh sách khách hàng và công nợ hiện tại</CardDescription>
        </CardHeader>
        <CardContent>
          <Table<Customer> rowKey="id" columns={columns} dataSource={customers} pagination={{ pageSize: 5 }} scroll={{ x: 800 }} />
        </CardContent>
      </Card>
    </PageShell>
  );
}
''',
    'src/features/transactions/pages/transactions-page.tsx': r'''import { DatePicker, Space, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { PageShell } from "@/components/layout/page-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { transactions, type Transaction } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";

const columns: ColumnsType<Transaction> = [
  { title: "Mã giao dịch", dataIndex: "id", key: "id" },
  { title: "Khách hàng", dataIndex: "customer", key: "customer" },
  { title: "Kênh", dataIndex: "channel", key: "channel" },
  { title: "Thời gian", dataIndex: "createdAt", key: "createdAt" },
  { title: "Tổng tiền", dataIndex: "total", key: "total", render: (value: number) => formatCurrency(value) },
  {
    title: "Trạng thái",
    dataIndex: "status",
    key: "status",
    render: (status: Transaction["status"]) => <Tag color={status === "Hoàn thành" ? "green" : status === "Chờ xử lý" ? "orange" : "red"}>{status}</Tag>,
  },
];

export function TransactionsPage() {
  return (
    <PageShell>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
          <div>
            <CardTitle>Lịch sử giao dịch</CardTitle>
            <CardDescription>Lọc hóa đơn theo thời gian và trạng thái</CardDescription>
          </div>
          <Space>
            <DatePicker.RangePicker />
          </Space>
        </CardHeader>
        <CardContent>
          <Table<Transaction> rowKey="id" columns={columns} dataSource={transactions} pagination={{ pageSize: 6 }} />
        </CardContent>
      </Card>
    </PageShell>
  );
}
''',
    'src/features/reports/pages/tax-report-page.tsx': r'''import { PageShell } from "@/components/layout/page-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function TaxReportPage() {
  return (
    <PageShell>
      <Card>
        <CardHeader>
          <CardTitle>Báo cáo thuế</CardTitle>
          <CardDescription>Trang này được dựng để map từ module `bao-cao-thue` của Angular sang React.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>- Tổng doanh thu chịu thuế: 525.000.000đ</p>
          <p>- Thuế GTGT đầu ra: 52.500.000đ</p>
          <p>- Thuế GTGT đầu vào được khấu trừ: 21.000.000đ</p>
          <p>- Số thuế tạm tính phải nộp: 31.500.000đ</p>
        </CardContent>
      </Card>
    </PageShell>
  );
}
''',
    'src/features/reports/pages/quote-report-page.tsx': r'''import { Table } from "antd";
import { PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { products } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";

export function QuoteReportPage() {
  return (
    <PageShell>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
          <div>
            <CardTitle>Bảng báo giá</CardTitle>
            <CardDescription>Xuất danh sách sản phẩm và giá bán hiện tại</CardDescription>
          </div>
          <Button>Xuất báo giá</Button>
        </CardHeader>
        <CardContent>
          <Table
            rowKey="id"
            dataSource={products}
            columns={[
              { title: "Sản phẩm", dataIndex: "name" },
              { title: "Danh mục", dataIndex: "category" },
              { title: "Giá", dataIndex: "price", render: (value: number) => formatCurrency(value) },
            ]}
            pagination={false}
          />
        </CardContent>
      </Card>
    </PageShell>
  );
}
''',
    'src/features/statistics/pages/statistics-page.tsx': r'''import { ResponsiveContainer, Tooltip, XAxis, YAxis, AreaChart, Area } from "recharts";
import { PageShell } from "@/components/layout/page-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { revenueTrend } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";

export function StatisticsPage() {
  return (
    <PageShell>
      <Card>
        <CardHeader>
          <CardTitle>Thống kê</CardTitle>
          <CardDescription>Biểu đồ doanh thu theo tuần</CardDescription>
        </CardHeader>
        <CardContent className="h-[360px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueTrend}>
              <XAxis dataKey="name" />
              <YAxis tickFormatter={(value) => `${Number(value) / 1000000}tr`} />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Area type="monotone" dataKey="revenue" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </PageShell>
  );
}
''',
    'src/features/barcode/pages/barcode-page.tsx': r'''import { ScanLine } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function BarcodePage() {
  return (
    <PageShell>
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Quét mã vạch</CardTitle>
          <CardDescription>Khung sẵn sàng để tích hợp scanner thật hoặc camera scanning library.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-3xl border border-dashed p-10 text-center">
            <ScanLine className="mx-auto h-16 w-16 text-muted-foreground" />
            <p className="mt-4 text-sm text-muted-foreground">Khu vực preview thiết bị scan</p>
          </div>
          <Input placeholder="Nhập mã vạch thủ công" />
          <Button>Bắt đầu quét</Button>
        </CardContent>
      </Card>
    </PageShell>
  );
}
''',
    'src/features/purchase-receipts/pages/purchase-receipts-page.tsx': r'''import { Table } from "antd";
import { PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

const receipts = [
  { id: "PN001", supplier: "Công ty Tin học A", total: 12000000, date: "2026-03-29", status: "Đã nhập" },
  { id: "PN002", supplier: "Công ty Phụ kiện B", total: 4500000, date: "2026-03-30", status: "Chờ duyệt" },
];

export function PurchaseReceiptsPage() {
  return (
    <PageShell>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
          <div>
            <CardTitle>Phiếu nhập</CardTitle>
            <CardDescription>Quản lý nhập kho theo nhà cung cấp</CardDescription>
          </div>
          <Button>Tạo phiếu nhập</Button>
        </CardHeader>
        <CardContent>
          <Table
            rowKey="id"
            dataSource={receipts}
            columns={[
              { title: "Mã phiếu", dataIndex: "id" },
              { title: "Nhà cung cấp", dataIndex: "supplier" },
              { title: "Ngày nhập", dataIndex: "date" },
              { title: "Tổng tiền", dataIndex: "total", render: (value: number) => formatCurrency(value) },
              { title: "Trạng thái", dataIndex: "status" },
            ]}
          />
        </CardContent>
      </Card>
    </PageShell>
  );
}
''',
    'src/features/settings/pages/settings-page.tsx': r'''import { Switch } from "antd";
import { useState } from "react";
import { PageShell } from "@/components/layout/page-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function SettingsPage() {
  const [emailNotify, setEmailNotify] = useState(true);
  const [desktopNotify, setDesktopNotify] = useState(false);

  return (
    <PageShell>
      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Cài đặt hệ thống</CardTitle>
            <CardDescription>Tùy chỉnh các hành vi cơ bản của ứng dụng</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-2xl border p-4">
              <div>
                <p className="font-medium">Thông báo email</p>
                <p className="text-sm text-muted-foreground">Gửi email khi phát sinh hóa đơn mới</p>
              </div>
              <Switch checked={emailNotify} onChange={setEmailNotify} />
            </div>
            <div className="flex items-center justify-between rounded-2xl border p-4">
              <div>
                <p className="font-medium">Thông báo desktop</p>
                <p className="text-sm text-muted-foreground">Hiển thị thông báo nổi khi có giao dịch mới</p>
              </div>
              <Switch checked={desktopNotify} onChange={setDesktopNotify} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Thông tin migrate</CardTitle>
            <CardDescription>Những phần đã chuẩn bị để nối backend thật</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>- Axios instance chung với interceptor token.</p>
            <p>- Auth state bằng Zustand.</p>
            <p>- Route guard đã tách riêng.</p>
            <p>- Có thể thay mock data bằng API trong từng feature.</p>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
''',
    'src/features/errors/pages/forbidden-page.tsx': r'''import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ForbiddenPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <Card className="max-w-lg text-center">
        <CardHeader>
          <CardTitle>403 - Không có quyền truy cập</CardTitle>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link to="/">Về trang chủ</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
''',
    'src/features/errors/pages/not-found-page.tsx': r'''import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <Card className="max-w-lg text-center">
        <CardHeader>
          <CardTitle>404 - Không tìm thấy trang</CardTitle>
          <CardDescription>Route này chưa tồn tại hoặc đã bị thay đổi khi migrate sang React.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link to="/">Quay lại dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
''',
    'src/app/router/index.tsx': r'''import { createBrowserRouter } from "react-router-dom";
import { ProtectedRoute, GuestRoute } from "@/app/router/guards";
import { AuthLayout } from "@/layouts/auth-layout";
import { MainLayout } from "@/layouts/main-layout";
import { DashboardPage } from "@/features/dashboard/pages/dashboard-page";
import { LoginPage } from "@/features/auth/pages/login-page";
import { SalesPage } from "@/features/sales/pages/sales-page";
import { InventoryPage } from "@/features/inventory/pages/inventory-page";
import { CustomersPage } from "@/features/customers/pages/customers-page";
import { TransactionsPage } from "@/features/transactions/pages/transactions-page";
import { TaxReportPage } from "@/features/reports/pages/tax-report-page";
import { QuoteReportPage } from "@/features/reports/pages/quote-report-page";
import { StatisticsPage } from "@/features/statistics/pages/statistics-page";
import { BarcodePage } from "@/features/barcode/pages/barcode-page";
import { PurchaseReceiptsPage } from "@/features/purchase-receipts/pages/purchase-receipts-page";
import { SettingsPage } from "@/features/settings/pages/settings-page";
import { ForbiddenPage } from "@/features/errors/pages/forbidden-page";
import { NotFoundPage } from "@/features/errors/pages/not-found-page";

export const router = createBrowserRouter([
  {
    element: <GuestRoute />,
    children: [
      {
        element: <AuthLayout />,
        children: [{ path: "/login", element: <LoginPage /> }],
      },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <MainLayout />,
        children: [
          { path: "/", element: <DashboardPage /> },
          { path: "/sales", element: <SalesPage /> },
          { path: "/inventory", element: <InventoryPage /> },
          { path: "/customers", element: <CustomersPage /> },
          { path: "/transactions", element: <TransactionsPage /> },
          { path: "/reports/tax", element: <TaxReportPage /> },
          { path: "/reports/quotes", element: <QuoteReportPage /> },
          { path: "/statistics", element: <StatisticsPage /> },
          { path: "/barcode", element: <BarcodePage /> },
          { path: "/purchase-receipts", element: <PurchaseReceiptsPage /> },
          { path: "/settings", element: <SettingsPage /> },
        ],
      },
    ],
  },
  { path: "/forbidden", element: <ForbiddenPage /> },
  { path: "*", element: <NotFoundPage /> },
]);
''',
}

for rel, content in files.items():
    path = root / rel
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding='utf-8')

print('[OK] project files generated')
