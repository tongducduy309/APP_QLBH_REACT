import * as XLSX from "xlsx-js-style";
import type { OrderRes } from "@/types/order";
import { formatDateToDDMMYYYY } from "./Quotation-pdf-print.service";

export type QuotationExportFieldKey =
  | "stt"
  | "productName"
  | "baseUnit"
  | "weight"
  | "unitPrice";

export type QuotationExportOptions = {
  fileName?: string;
  sheetName?: string;
  fields: QuotationExportFieldKey[];
};

function safeText(value: unknown): string {
  return String(value ?? "").trim();
}

function safeNumber(value: unknown): number {
  const num = Number(value ?? 0);
  return Number.isFinite(num) ? num : 0;
}

function formatQuantity(n: number): string {
  const num = Number(n || 0);
  if (Number.isInteger(num)) return String(num);
  return num.toLocaleString("vi-VN", { maximumFractionDigits: 3 });
}

function autoFitColumnWidths(rows: (string | number)[][]) {
  if (!rows.length) return [];

  const colCount = Math.max(...rows.map((row) => row.length));

  return Array.from({ length: colCount }, (_, colIndex) => {
    const maxLen = rows.reduce((max, row) => {
      const cell = row[colIndex];
      const len = String(cell ?? "").length;
      return Math.max(max, len);
    }, 10);

    return { wch: Math.min(maxLen + 2, 40) };
  });
}

function getProductDisplayName(item: any) {
  const name = safeText(item.name);
  const kind = safeText(item.kind);

  if (name && kind && !name.endsWith(`(${kind})`)) {
    return `${name} (${kind})`;
  }

  return name || kind || "-";
}

function getWeight(item: any): string {
  const raw = item.weight ?? item.unitWeight ?? item.totalWeight ?? null;

  if (raw === null || raw === undefined || raw === "") return "-";

  const num = Number(raw);
  if (Number.isFinite(num)) return formatQuantity(num);

  return String(raw).trim() || "-";
}

export const QUOTATION_EXPORT_FIELD_OPTIONS: {
  label: string;
  value: QuotationExportFieldKey;
}[] = [
  { label: "STT", value: "stt" },
  { label: "Tên sản phẩm", value: "productName" },
  { label: "Đơn vị", value: "baseUnit" },
  { label: "Trọng lượng", value: "weight" },
  { label: "Đơn giá", value: "unitPrice" },
];

function getFieldLabel(field: QuotationExportFieldKey): string {
  const found = QUOTATION_EXPORT_FIELD_OPTIONS.find((item) => item.value === field);
  return found?.label ?? field;
}

function getCellValue(
  field: QuotationExportFieldKey,
  item: any,
  index: number
): string | number {
  const unitPrice = safeNumber(item.price);

  switch (field) {
    case "stt":
      return index + 1;
    case "productName":
      return getProductDisplayName(item);
    case "baseUnit":
      return safeText(item.baseUnit) || "-";
    case "weight":
      return getWeight(item);
    case "unitPrice":
      return unitPrice;
    default:
      return "-";
  }
}

export function exportQuotationExcel(
  order: OrderRes,
  options: QuotationExportOptions
) {
  const details = Array.isArray(order.details) ? order.details : [];

  const fields: QuotationExportFieldKey[] = options.fields?.length
    ? options.fields
    : ["stt", "productName", "baseUnit", "weight", "unitPrice"];

  const createdAt = order.createdAt ?? new Date().toISOString();
  const datePart = formatDateToDDMMYYYY(createdAt);
  const codePart = safeText(order.code) || "bao-gia";

  const fileName =
    options.fileName ||
    (datePart ? `${codePart}-${datePart}.xlsx` : `${codePart}.xlsx`);

  const sheetName = options.sheetName || "BaoGia";

  const headerRow = fields.map((field) => getFieldLabel(field));

  const dataRows: (string | number)[][] = details.map((item: any, index: number) =>
    fields.map((field) => getCellValue(field, item, index))
  );

  const rows: (string | number)[][] = [headerRow, ...dataRows];

  const worksheet = XLSX.utils.aoa_to_sheet(rows);
  worksheet["!cols"] = autoFitColumnWidths(rows);

  const range = XLSX.utils.decode_range(worksheet["!ref"] || "A1");
  const unitPriceIndex = fields.findIndex((field) => field === "unitPrice");

  const ALL_BORDER = {
    top: { style: "thin", color: { rgb: "000000" } },
    bottom: { style: "thin", color: { rgb: "000000" } },
    left: { style: "thin", color: { rgb: "000000" } },
    right: { style: "thin", color: { rgb: "000000" } },
  } as const;

  // Tạo đủ cell cho toàn bộ bảng để border không bị hở
  for (let row = range.s.r; row <= range.e.r; row += 1) {
    for (let col = range.s.c; col <= range.e.c; col += 1) {
      const addr = XLSX.utils.encode_cell({ r: row, c: col });

      if (!worksheet[addr]) {
        worksheet[addr] = { t: "s", v: "" };
      }
    }
  }

  // Header
  for (let col = range.s.c; col <= range.e.c; col += 1) {
    const addr = XLSX.utils.encode_cell({ r: 0, c: col });

    worksheet[addr].s = {
      font: {
        bold: true,
        color: { rgb: "000000" },
        sz: 12,
      },
      fill: {
        patternType: "solid",
        fgColor: { rgb: "F1C40F" },
        bgColor: { rgb: "F1C40F" },
      },
      alignment: {
        horizontal: "center",
        vertical: "center",
        wrapText: true,
      },
      border: ALL_BORDER,
    };
  }

  // Data rows
  for (let row = 1; row <= range.e.r; row += 1) {
    for (let col = range.s.c; col <= range.e.c; col += 1) {
      const addr = XLSX.utils.encode_cell({ r: row, c: col });
      const isUnitPriceColumn = col === unitPriceIndex;

      worksheet[addr].s = {
        alignment: {
          vertical: "center",
          horizontal: isUnitPriceColumn ? "right" : "left",
          wrapText: true,
        },
        border: ALL_BORDER,
        ...(isUnitPriceColumn
          ? {
              numFmt: "#,##0",
            }
          : {}),
      };
    }
  }

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  XLSX.writeFile(workbook, fileName);
}