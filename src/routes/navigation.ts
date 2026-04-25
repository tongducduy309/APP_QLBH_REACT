import { BarChart3, Boxes, FileSpreadsheet, LayoutDashboard, LucideIcon, Receipt, Settings, ShoppingCart, User, Users } from "lucide-react";
import { paths } from "@/routes/paths";
import { Role } from "@/types/user";

interface NavigationItem {
  label: string;
  path: string;
  icon: LucideIcon;
  subtitle?: string;
  roles?: Role[];
}

export const navigationItems: NavigationItem[] = [
  { label: "Tổng quan", path: paths.dashboard, icon: LayoutDashboard, subtitle: "Tổng quan trong 24h và giao dịch gần đây", roles: ["ADMIN", "STORE_MANAGER", "OFFICE_STAFF", "OPERATOR_DELIVERY"] },
  { label: "Bán hàng", path: paths.sales, icon: ShoppingCart, roles: ["ADMIN", "STORE_MANAGER", "OFFICE_STAFF"]},
  { label: "Hàng hóa", path: paths.inventory, icon: Boxes, roles: ["ADMIN", "STORE_MANAGER", "OFFICE_STAFF"]},
  { label: "Khách hàng", path: paths.customers, icon: Users, roles: ["ADMIN", "STORE_MANAGER", "OFFICE_STAFF"]},
  { label: "Giao dịch", path: paths.transactions, icon: Receipt, roles: ["ADMIN", "STORE_MANAGER", "OFFICE_STAFF", "OPERATOR_DELIVERY"]},
  // { label: "Báo cáo thuế", path: paths.taxReport, icon: FileText},
  { label: "Bảng báo giá", path: paths.quoteReport, icon: FileSpreadsheet, roles: ["ADMIN", "STORE_MANAGER", "OFFICE_STAFF"]},
  { label: "Thống kê", path: paths.statistics, icon: BarChart3, roles: ["ADMIN", "STORE_MANAGER", "OFFICE_STAFF"]},
  // { label: "Quét mã vạch", path: paths.barcode, icon: ScanBarcode },
  { label: "Nhân viên", path: paths.employees, icon: User, roles: ["ADMIN", "STORE_MANAGER" , "OFFICE_STAFF"]},
  { label: "Phiếu nhập", path: paths.purchaseReceipts, icon: Receipt, roles: ["ADMIN", "STORE_MANAGER", "OFFICE_STAFF"]},
  { label: "Cài đặt", path: paths.settings, icon: Settings, roles: ["ADMIN", "STORE_MANAGER", "OFFICE_STAFF"]},
] as const;
