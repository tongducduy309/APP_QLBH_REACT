import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import type {
  Alignment,
  Content,
  StyleDictionary,
  TDocumentDefinitions,
} from "pdfmake/interfaces";
import JsBarcode from "jsbarcode";
import { OrderRes } from "@/types/order";
import { DataPdf, DataPdfProduct, PaperSize, PrintOptions } from "../types/print.type";
import { buildMergedNameRowsFromAllProducts, formatMoney } from "../utils/print-helper";
import { sortOrderResDetails } from "@/utils/order.helper";
import { useSettingsStore } from "@/features/settings/store/settings-store";

(pdfMake as any).vfs = (pdfFonts as any)?.pdfMake?.vfs || (pdfFonts as any);





const LOGO_BASE64 =
  'data:image/jpeg;base64,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'






function numberToVietnameseWords(num: number): string {
  const units = [
    "",
    "một",
    "hai",
    "ba",
    "bốn",
    "năm",
    "sáu",
    "bảy",
    "tám",
    "chín",
  ];
  const scales = ["", "nghìn", "triệu", "tỷ", "nghìn tỷ", "triệu tỷ"];

  const readTriple = (n: number, full: boolean) => {
    const hundred = Math.floor(n / 100);
    const ten = Math.floor((n % 100) / 10);
    const unit = n % 10;
    let result = "";

    if (full || hundred > 0) {
      result += `${units[hundred]} trăm`;
      if (ten === 0 && unit > 0) result += " lẻ";
    }

    if (ten > 1) {
      result += ` ${units[ten]} mươi`;
      if (unit === 1) result += " mốt";
      else if (unit === 5) result += " lăm";
      else if (unit > 0) result += ` ${units[unit]}`;
    } else if (ten === 1) {
      result += " mười";
      if (unit === 5) result += " lăm";
      else if (unit > 0) result += ` ${units[unit]}`;
    } else if (ten === 0 && unit > 0) {
      result += ` ${units[unit]}`;
    }

    return result.trim();
  };

  const input = Math.round(Number(num || 0));
  if (input === 0) return "Không đồng";

  const groups: number[] = [];
  let temp = input;
  while (temp > 0) {
    groups.push(temp % 1000);
    temp = Math.floor(temp / 1000);
  }

  let result = "";
  for (let i = groups.length - 1; i >= 0; i--) {
    if (groups[i] === 0) continue;
    const full = i !== groups.length - 1;
    result += `${readTriple(groups[i], full)} ${scales[i]} `;
  }

  result = result.trim().replace(/\s+/g, " ");
  return `${result.charAt(0).toUpperCase()}${result.slice(1)} đồng`;
}

function formatTimestampDMY(input?: string) {
  const d = input ? new Date(input) : new Date();
  return {
    day: String(d.getDate()).padStart(2, "0"),
    month: String(d.getMonth() + 1).padStart(2, "0"),
    year: d.getFullYear(),
  };
}

function generateBarcodeDataUrl(
  value: string,
  options: Partial<JsBarcode.Options> = {}
): string {
  const canvas = document.createElement("canvas");
  JsBarcode(canvas, value || "", {
    format: options.format || "CODE128",
    width: options.width ?? 2,
    height: options.height ?? 80,
    displayValue: options.displayValue ?? false,
    margin: options.margin ?? 4,
    lineColor: (options as any).lineColor ?? "#000",
  } as any);
  return canvas.toDataURL("image/png");
}

function padTable(table: any, targetRows: number) {
  const cols = table.table.widths.length;
  while (table.table.body.length < targetRows) {
    table.table.body.push(
      Array.from({ length: cols }).map(() => ({
        text: " ",
        margin: [0, 0, 0, 0],
        style: "s12",
      }))
    );
  }
  return table;
}

function toDataPdf(data: OrderRes): DataPdf {
  const products: DataPdfProduct[] = (data.details ?? []).map((item: any) => {
    const qty = Number(item.quantity ?? 0);
    const length = Number(item.length ?? 0);
    const totalQuantity =
      Number(item.totalQuantity ?? 0) || (length > 0 ? qty * length : qty);

    const subtotal =
      length > 0
        ? Number(item.price ?? 0) * totalQuantity
        : Number(item.price ?? 0) * qty;

    return {

      name: item.name ?? "",
      baseUnit: item.baseUnit ?? "",
      length,
      quantity: qty,
      totalQuantity,
      price: Number(item.price ?? 0),
      subtotal,
    };
  });

  return {
    id: data.id+"",
    code: data.code,
    createdAt: data.createdAt,
    customer: data.customer
      ? {
        name: (data.customer as any).name ?? "",
        phone: (data.customer as any).phone ?? "",
        address: (data.customer as any).address ?? "",
      }
      : null,
    products,
    subtotal: Number(data.subtotal ?? 0),
    tax: Number(data.tax ?? 0),
    taxAmount: Number(data.taxAmount ?? 0),
    shippingFee: Number(data.shippingFee ?? 0),
    total: Number(data.total ?? 0),
    paidAmount: Number(data.paidAmount ?? 0),
    remainingAmount: Number(data.remainingAmount ?? 0),
    note: data.note ?? "",
  };
}

function buildInvoiceContent(data: DataPdf, opt: PrintOptions): Content[] {
  const barcodeBase64 = generateBarcodeDataUrl(data.code || "", {
    format: "CODE128",
    height: 60,
  });

  const header = [
    [
      { text: "STT", style: "tableHeader" },
      { text: "Nội dung", style: "tableHeader" },
      { text: "Đơn vị", style: "tableHeader" },
      { text: "Chiều dài", style: "tableHeader" },
      { text: "Số lượng", style: "tableHeader" },
      { text: "Tổng SL", style: "tableHeader" },
      { text: "Đơn giá", style: "tableHeader" },
      { text: "Thành tiền", style: "tableHeader" },
    ],
  ];

  const body = buildMergedNameRowsFromAllProducts(data.products);

  const createdAt = data.createdAt ? formatTimestampDMY(data.createdAt) : formatTimestampDMY();
  const ngay = createdAt.day;
  const thang = createdAt.month;
  const nam = createdAt.year;

  opt.pageOrientation = opt.paperSize === "A5" ? "landscape" : opt.pageOrientation;

  let headerInfo: any;

  if (opt.paperSize === "A5") {
    headerInfo = {
      widths: [210, 180, 145],
      body: [
        [
          {
            stack: [
              { text: "CÔNG TY TNHH MTV DV TÔN THÉP", style: "companySub" },
              { text: "TÂM ĐỨC CƯỜNG", style: "companyMain" },
              {
                stack: [
                  { text: "Địa chỉ: 413 Nguyễn Văn Tạo, Hiệp Phước, HCM", style: "companyInfo" },
                  { text: "Di động: 0918.279.361 - 0933.770.378", style: "companyInfo" },
                  { text: "Mã số thuế: 0305971408", style: "companyInfo" },
                  { text: "Ngân hàng SACOMBANK: 060128011741", style: "companyInfo" },
                ],
              },
            ],
          },
          {
            stack: [
              { text: "Dịch Vụ", style: "companyMain2", alignment: "center" as Alignment },
              { text: "Sắt Thép - Xà Gồ - Tôn Lạnh", style: "headerRight" },
              { text: "Tôn Kẽm - Tôn Màu - Uốn Vòm - Máng Xối", style: "headerRight" },
              { text: "Cắt Theo Yêu Cầu", style: "headerRight" },
            ],
          },
          {
            stack: [
              { text: "BIÊN NHẬN GIAO HÀNG", style: "deliveryNoteTitle" },
              { text: `Số: ${data.code || "..."}`, style: "deliveryNoteCode" },
              { image: barcodeBase64, width: 100, alignment: "center" as Alignment },
            ],
            alignment: "center" as Alignment,
          },
        ],
        [
          {
            table: {
              widths: [60, 280, 80, 100],
              body: [
                [
                  { text: "Khách Hàng:", bold: true, style: "s12" },
                  { text: data.customer?.name || "", style: "s12" },
                  { text: "Số Điện Thoại:", bold: true, style: "s12" },
                  { text: data.customer?.phone || "", style: "s12" },
                ],
                [
                  { text: "Địa Chỉ:", bold: true, style: "s12" },
                  { text: data.customer?.address || "", style: "s12" },
                  {},
                  {},
                ],
              ],
            },
            layout: "noBorders",
            colSpan: 3,
          },
          {},
          {},
        ],
      ],
    };
  } else {
    headerInfo =
      opt.pageOrientation !== "landscape"
        ? {
          widths: [90, 220, "*"],
          body: [
            [
              {
                image: "logo",
                width: 80,
                margin: [0, 0, 0, 0],
              },
              {
                stack: [
                  { text: "CÔNG TY TNHH MTV DV TÔN THÉP", style: "companySub" },
                  { text: "TÂM ĐỨC CƯỜNG", style: "companyMain" },
                  {
                    stack: [
                      {
                        text: "Địa chỉ: 413 Nguyễn Văn Tạo, Hiệp Phước, Hồ Chí Minh",
                        style: "companyInfo",
                      },
                      {
                        text: "Di động: 0918.279.361 - 0933.770.378",
                        style: "companyInfo",
                      },
                      { text: "Mã số thuế: 0305971408", style: "companyInfo" },
                      {
                        text: "Ngân hàng SACOMBANK: 060128011741",
                        style: "companyInfo",
                      },
                    ],
                  },
                ],
              },
              {
                stack: [
                  { text: "Sắt Thép - Xà Gồ - Tôn Lạnh", style: "headerRight" },
                  { text: "Tôn Kẽm - Tôn Màu - Uốn Vòm - Máng Xối", style: "headerRight" },
                  { text: "Cắt Theo Yêu Cầu", style: "headerRight" },
                  { text: "BIÊN NHẬN GIAO HÀNG", style: "deliveryNoteTitle" },
                  { text: `Số: ${data.code || "..."}`, style: "deliveryNoteCode" },
                ],
                alignment: "center" as Alignment,
              },
            ],
            [
              {
                table: {
                  widths: [100, 400],
                  body: [
                    [{ text: "Khách Hàng:", bold: true, style: "s12" }, { text: data.customer?.name || "", style: "s12" }],
                    [{ text: "Số Điện Thoại:", bold: true, style: "s12" }, { text: data.customer?.phone || "", style: "s12" }],
                    [{ text: "Địa Chỉ:", bold: true, style: "s12" }, { text: data.customer?.address || "", style: "s12" }],
                  ],
                },
                layout: "noBorders",
              },
              {},
              { image: barcodeBase64, width: 100, alignment: "center" as Alignment },
            ],
          ],
        }
        : {
          widths: [220, "auto", "*"],
          body: [
            [
              {
                stack: [
                  { text: "CÔNG TY TNHH MTV DV TÔN THÉP", style: "companySub" },
                  { text: "TÂM ĐỨC CƯỜNG", style: "companyMain" },
                  {
                    image: "logo",
                    width: 80,
                    margin: [0, 0, 0, 0],
                  },
                ],
                alignment: "center" as Alignment,
              },
              {
                stack: [
                  { text: "Thông Tin Liên Hệ", style: "companyMain2", alignment: "center" as Alignment },
                  {
                    stack: [
                      {
                        text: "Địa chỉ: 413 Nguyễn Văn Tạo, Hiệp Phước, Hồ Chí Minh",
                        style: "companyInfo",
                      },
                      {
                        text: "Di động: 0918.279.361 - 0933.770.378",
                        style: "companyInfo",
                      },
                      { text: "Mã số thuế: 0305971408", style: "companyInfo" },
                      {
                        text: "Ngân hàng SACOMBANK: 060128011741",
                        style: "companyInfo",
                      },
                    ],
                  },
                ],
              },
              {
                stack: [
                  { text: "Sắt Thép - Xà Gồ - Tôn Lạnh", style: "headerRight" },
                  { text: "Tôn Kẽm - Tôn Màu - Uốn Vòm - Máng Xối", style: "headerRight" },
                  { text: "Cắt Theo Yêu Cầu", style: "headerRight" },
                  { text: "BIÊN NHẬN GIAO HÀNG", style: "deliveryNoteTitle" },
                  { text: `Số: ${data.code || "..."}`, style: "deliveryNoteCode" },
                  { image: barcodeBase64, width: 100, alignment: "center" as Alignment },
                ],
                alignment: "center" as Alignment,
              },
            ],
            [
              {
                table: {
                  widths: [100, 400],
                  body: [
                    [{ text: "Khách Hàng:", bold: true, style: "s12" }, { text: data.customer?.name || "", style: "s12" }],
                    [{ text: "Số Điện Thoại:", bold: true, style: "s12" }, { text: data.customer?.phone || "", style: "s12" }],
                    [{ text: "Địa Chỉ:", bold: true, style: "s12" }, { text: data.customer?.address || "", style: "s12" }],
                  ],
                },
                layout: "noBorders",
                colSpan: 3,
              },
              {},
              {},
            ],
          ],
        };
  }

  const hasTax = !!data.tax;
  const hasShip = !!data.shippingFee;

  const noPaddingLayout = {
    hLineWidth: () => 0,
    vLineWidth: () => 0,
    paddingLeft: () => 0,
    paddingRight: () => 0,
    paddingTop: () => 10,
    paddingBottom: () => 0,
  };

  let leftTable: any = {
    table: {
      widths: ["auto", "*"],
      body: [
        [
          {
            text: "TẠM TÍNH:",
            bold: true,
            alignment: "left",
            style: "s12",
            margin: [10, 0, 0, 0],
          },
          { text: formatMoney(data.subtotal || 0), alignment: "left", style: "s12" },
        ],
        ...(hasTax
          ? [[
            {
              text: `THUẾ GTGT(${data.tax}%):`,
              bold: true,
              alignment: "left",
              style: "s12",
              margin: [10, 0, 0, 0],
            },
            { text: formatMoney(data.taxAmount || 0), alignment: "left", style: "s12" },
          ]]
          : []),
        ...(hasShip
          ? [[
            {
              text: "PHÍ VẬN CHUYỂN:",
              bold: true,
              alignment: "left",
              style: "s12",
              margin: [10, 0, 0, 0],
            },
            { text: formatMoney(data.shippingFee || 0), alignment: "left", style: "s12" },
          ]]
          : []),
      ],
    },
    layout: "noBorders",
  };

  let rightTable: any = {
    table: {
      widths: ["auto", "*"],
      body: [
        [
          { text: "TỔNG CỘNG:", bold: true, alignment: "left", style: "s12" },
          { text: formatMoney(data.total || 0), alignment: "left", style: "s12" },
        ],
        ...(data.paidAmount
          ? [[
            { text: "ĐÃ THANH TOÁN:", bold: true, alignment: "left", style: "s12" },
            { text: formatMoney(data.paidAmount || 0), alignment: "left", style: "s12" },
          ]]
          : []),
        [
          { text: "CẦN THANH TOÁN:", bold: true, alignment: "left", style: "s12" },
          {
            text: formatMoney(data.remainingAmount || 0),
            bold: true,
            alignment: "left",
            style: "s12",
          },
        ],
      ],
    },
    layout: "noBorders",
  };

  const maxRows = Math.max(leftTable.table.body.length, rightTable.table.body.length);
  leftTable = padTable(leftTable, maxRows);
  rightTable = padTable(rightTable, maxRows);

  const summary = {
    table: {
      widths: ["*", "*"],
      body: [[{ stack: [leftTable] }, { stack: [rightTable] }]],
    },
    layout: noPaddingLayout,
  };

  return [
    {
      table: headerInfo,
      layout: "noBorders",
      margin: [0, 0, 0, 10],
    },
    {
      table: {
        headerRows: 1,
        widths: ["auto", "*", "auto", "auto", "auto", "auto", "auto", "auto"],
        body: [...header, ...body],
      },
      layout: {
        fillColor: (rowIndex: number) => {
          if (rowIndex === 0) return "#f1c40f";
          return null;
        },
      },
    },
    summary,
    {
      text: `\nBằng chữ: ${numberToVietnameseWords(data.remainingAmount || 0)}`,
      italics: true,
      style: "s12",
    },
    {
      columns: [
        {
          width: "auto",
          text: `\nGhi chú:`,
          italics: true,
          bold: true,
          margin: [0, 0, 10, 0],
          style: "s11",
        },
        {
          width: "auto",
          text: `\n${data.note || ""}`,
          italics: true,
          style: "s11",
        },
      ],
    },
    {
      table: {
        widths: ["*", "*", "*"],
        body: [
          [
            {
              stack: [
                { text: "\n\nNgười Nhận Hàng", style: "s12", alignment: "center" as Alignment },
                { text: " ", style: "s12", alignment: "center" as Alignment },
              ],
            },
            { text: "" },
            {
              stack: [
                {
                  text: `Ngày ${ngay} Tháng ${thang} Năm ${nam}`,
                  style: "s12",
                  alignment: "center" as Alignment,
                },
                { text: "\nNgười Bán Hàng", style: "s12", alignment: "center" as Alignment },
              ],
            },
          ],
        ],
      },
      layout: "noBorders",
    },
  ];
}

function buildInvoiceDocDefinition(
  order: OrderRes,
): TDocumentDefinitions {
  const data = toDataPdf(order);
  const settings = useSettingsStore.getState().settings;
  const opts: PrintOptions = settings?.printOptions || {};
  const paperSize: PaperSize = opts.paperSize ?? "A4";
  const copies = Math.max(1, Math.min(50, opts.copies ?? 1));

  const content: Content[] = [];
  for (let i = 0; i < copies; i++) {
    content.push(...buildInvoiceContent(data, opts));
    if (i < copies - 1) content.push({ text: "", pageBreak: "after" });
  }

  const styles: StyleDictionary =
    opts.paperSize === "A4"
      ? {
        companyInfo: { fontSize: 10 },
        companySub: { fontSize: 11, alignment: "center" as Alignment },
        companyMain: { fontSize: 14, bold: true, alignment: "center" as Alignment, margin: [0, 2] },
        companyMain2: { fontSize: 12, bold: true, alignment: "center" as Alignment, margin: [0, 2] },
        headerRight: { fontSize: 10, margin: [0, 1], alignment: "center" as Alignment },
        deliveryNoteTitle: { fontSize: 13, bold: true, margin: [0, 6, 0, 2], alignment: "center" as Alignment },
        deliveryNoteCode: { fontSize: 11, italics: true, alignment: "center" as Alignment },
        tableHeader: { bold: true, fontSize: 10, fillColor: "#f1c40f", alignment: "center" as Alignment },
        centerCell: { alignment: "center" as Alignment },
        priceCell: { alignment: "right" as Alignment },
        s12: { fontSize: 12 },
        s11: { fontSize: 11 },
      }
      : {
        companyInfo: { fontSize: 9 },
        companySub: { fontSize: 10, alignment: "center" as Alignment },
        companyMain: { fontSize: 12, bold: true, alignment: "center" as Alignment, margin: [0, 2] },
        companyMain2: { fontSize: 11, bold: true, alignment: "center" as Alignment, margin: [0, 2] },
        headerRight: { fontSize: 9, margin: [0, 1], alignment: "center" as Alignment },
        deliveryNoteTitle: { fontSize: 11, bold: true, margin: [0, 6, 0, 2], alignment: "center" as Alignment },
        deliveryNoteCode: { fontSize: 10, italics: true, alignment: "center" as Alignment },
        tableHeader: { bold: true, fontSize: 9, fillColor: "#f1c40f", alignment: "center" as Alignment },
        centerCell: { alignment: "center" as Alignment },
        priceCell: { alignment: "right" as Alignment },
        s12: { fontSize: 10 },
        s11: { fontSize: 9 },
      };

  return {
    pageSize: paperSize,
    pageOrientation: opts.pageOrientation ? opts.pageOrientation : "portrait",
    pageMargins: paperSize === "A4" ? [20, 20, 20, 20] : [16, 16, 16, 16],
    content,
    info: {
      title: `Biên nhận giao hàng ${data.code}`,
      author: "CÔNG TY TNHH MTV DV TÔN THÉP TÂM ĐỨC CƯỜNG",
      subject: "Biên nhận giao hàng",
      keywords: "hoa don, bien nhan, giao hang, ton thep",
      creator: "QLBH",
      producer: "QLBH App",
      creationDate: new Date(data.createdAt ?? Date.now()),
      trapped: "False" as any,
    },
    images: {
      logo: LOGO_BASE64,
    },
    styles,
    defaultStyle: {
      font: "Roboto",
    },
  };
}

function getPdfBuffer(docDefinition: TDocumentDefinitions): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    try {
      pdfMake.createPdf(docDefinition).getBuffer((buffer: Uint8Array) => {
        resolve(buffer);
      });
    } catch (error) {
      reject(error);
    }
  });
}



export async function printInvoice(data: OrderRes) {
  const dd = buildInvoiceDocDefinition(sortOrderResDetails(data));
  const settings = useSettingsStore.getState().settings;
  const opts: PrintOptions = settings?.printOptions || {};
  if (window.qlbh?.printPdfSilent) {
    const buf = await getPdfBuffer(dd);
    const bytes = Array.from(buf);

    const res = await window.qlbh.printPdfSilent({
      bytes,
      fileName: data.code ? `${data.code}.pdf` : "hoa-don.pdf",
      copies: opts.copies ?? 1,
      deviceName: opts.deviceName,
    });

    if (!res?.ok) {
      throw new Error(res?.error || "Silent print failed");
    }
    return;
  }

  pdfMake.createPdf(dd).print();
}

export function previewInvoice(data: OrderRes) {
  const dd = buildInvoiceDocDefinition(sortOrderResDetails(data));
  pdfMake.createPdf(dd).open();
}

export function downloadInvoice(data: OrderRes) {
  const dd = buildInvoiceDocDefinition(sortOrderResDetails(data));
  pdfMake.createPdf(dd).download(data.code ? `${data.code}.pdf` : "hoa-don.pdf");
}
