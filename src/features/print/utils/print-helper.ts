import { DataPdfProduct } from "../types/print.type";

export function groupProductsByName(products: DataPdfProduct[]) {
  const groups = new Map<string, DataPdfProduct[]>();

  for (const item of products) {
    const key = item.name ?? "";
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(item);
  }

  return Array.from(groups.entries()).map(([name, items]) => ({
    name,
    items,
  }));
}

export function formatQuantity(n: number): string {
  const num = Number(n || 0);
  if (Number.isInteger(num)) return String(num);
  return num.toLocaleString("vi-VN", { maximumFractionDigits: 3 });
}

export function formatMoney(n: number): string {
  return new Intl.NumberFormat("vi-VN").format(Number(n || 0));
}

export function buildMergedNameRowsFromAllProducts(products: DataPdfProduct[]) {
  const groups = groupProductsByName(products);
  const rows: any[] = [];
  let index = 1;

  for (const group of groups) {
    const span = group.items.length;

    group.items.forEach((item, itemIndex) => {
      rows.push([
        {
          text: index++,
          alignment: "center",
          style: "s12",
        },

        itemIndex === 0
          ? {
              text: group.name || " ",
              style: "s12",
              rowSpan: span,
              alignment: "left",
              margin: [0, span > 1 ? 6 : 0, 0, 0],
            }
          : {},

        {
          text: item.baseUnit || "-",
          alignment: "center",
          style: "s12",
        },
        {
          text: item.length ? formatQuantity(item.length) : "-",
          alignment: "center",
          style: "s12",
        },
        {
          text: item.quantity ? formatQuantity(item.quantity) : "-",
          alignment: "center",
          style: "s12",
        },
        {
          text: item.totalQuantity ? formatQuantity(item.totalQuantity) : "-",
          alignment: "center",
          style: "s12",
        },
        {
          text: item.price ? formatMoney(item.price) : "-",
          alignment: "right",
          style: "s12",
        },
        {
          text: item.subtotal ? formatMoney(item.subtotal) : "-",
          alignment: "right",
          style: "s12",
        },
      ]);
    });
  }

  return rows;
}