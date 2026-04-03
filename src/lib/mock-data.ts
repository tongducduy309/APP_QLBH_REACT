export type Product = {
  id: number;
  sku: string;
  name: string;
  categoryName: string;
  stock: number;
  active: boolean;
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

// export const products: Product[] = [
//   { id: 1, sku: "SP001", name: "Laptop Asus VivoBook", category: "Laptop", stock: 18, active: true },
//   { id: 2, sku: "SP002", name: "Chuột Logitech M331", category: "Phụ kiện", stock: 6, active: true },
//   { id: 3, sku: "SP003", name: "Màn hình Dell 24 inch", category: "Màn hình", stock: 0, active: false },
//   { id: 4, sku: "SP004", name: "Bàn phím cơ Keychron", category: "Phụ kiện", stock: 11, active: true },
// ];

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
