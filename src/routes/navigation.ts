import { BarChart3, Boxes, FileSpreadsheet, FileText, LayoutDashboard, LucideIcon, Receipt, Settings, ShoppingCart, Users } from "lucide-react";
import { paths } from "@/routes/paths";

interface NavigationItem {
  label: string;
  path: string;
  icon: LucideIcon;
  subtitle?: string;
}

export const navigationItems: NavigationItem[] = [
  { label: "Tổng quan", path: paths.dashboard, icon: LayoutDashboard, subtitle: "Tổng quan trong 24h và giao dịch gần đây"},
  { label: "Bán hàng", path: paths.sales, icon: ShoppingCart},
  { label: "Hàng hóa", path: paths.inventory, icon: Boxes},
  { label: "Khách hàng", path: paths.customers, icon: Users},
  { label: "Giao dịch", path: paths.transactions, icon: Receipt},
  // { label: "Báo cáo thuế", path: paths.taxReport, icon: FileText},
  { label: "Bảng báo giá", path: paths.quoteReport, icon: FileSpreadsheet},
  { label: "Thống kê", path: paths.statistics, icon: BarChart3},
  // { label: "Quét mã vạch", path: paths.barcode, icon: ScanBarcode },
  { label: "Phiếu nhập", path: paths.purchaseReceipts, icon: Receipt},
  { label: "Cài đặt", path: paths.settings, icon: Settings},
] as const;
