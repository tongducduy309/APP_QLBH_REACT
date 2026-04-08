import type { OrderRes } from "@/types/order";
import { formatDateToDDMMYYYY } from "./Quotation-pdf-print.service";

function escapeCsvValue(value: unknown) {
  const text = String(value ?? "");
  return `"${text.replace(/"/g, '""')}"`;
}

function formatMoney(n: number): string {
  return new Intl.NumberFormat("vi-VN").format(Number(n || 0));
}

function formatQuantity(n: number): string {
  const num = Number(n || 0);
  if (Number.isInteger(num)) return String(num);
  return num.toLocaleString("vi-VN", { maximumFractionDigits: 3 });
}

function downloadCsv(filename: string, rows: Record<string, unknown>[]) {
  if (!rows.length) return;

  const headers = Object.keys(rows[0]);

  const csvContent = [
    headers.join(","),
    ...rows.map((row) =>
      headers.map((header) => escapeCsvValue(row[header])).join(",")
    ),
  ].join("\n");

  const blob = new Blob(["\uFEFF" + csvContent], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportQuotationCsv(order: OrderRes) {
  const rows = (order.details ?? []).map((item: any, index: number) => {
    const quantity = Number(item.quantity ?? 0);
    const length = Number(item.length ?? 0);
    const totalQuantity =
      Number(item.totalQuantity ?? 0) ||
      (length > 0 ? length * quantity : quantity);

    const subtotal = Number(item.price ?? 0) * totalQuantity;

    return {
      STT: index + 1,
      "Mã báo giá": order.code ?? "",
      "Ngày tạo": order.createdAt ?? "",
      "Khách hàng": (order.customer as any)?.name ?? "",
      "Số điện thoại": (order.customer as any)?.phone ?? "",
      "Địa chỉ": (order.customer as any)?.address ?? "",
      "Tên sản phẩm": item.name ?? "",
      "Đơn vị": item.baseUnit ?? "",
      "Chiều dài": formatQuantity(length),
      "Số lượng": formatQuantity(quantity),
      "Tổng số lượng": formatQuantity(totalQuantity),
      "Đơn giá": Number(item.price ?? 0),
      "Đơn giá định dạng": formatMoney(Number(item.price ?? 0)),
      "Thành tiền": subtotal,
      "Thành tiền định dạng": formatMoney(subtotal),
      "Loại": item.kind ?? "",
      "Ghi chú": order.note ?? "",
    };
  });

  const datePart = formatDateToDDMMYYYY(order.createdAt ?? new Date().toISOString());
  const codePart = order.code || "bao-gia";

  downloadCsv(
    datePart ? `${codePart}-${datePart}.csv` : `${codePart}.csv`,
    rows
  );
}