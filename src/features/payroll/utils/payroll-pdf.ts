import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import type { TDocumentDefinitions } from "pdfmake/interfaces";
import type { PayrollEmployee } from "../types/payroll.types";
import { useSettingsStore } from "@/features/settings/store/settings-store";
import { PaperSize, PrintOptions } from "@/features/print/types/print.type";
import { formatDateToDDMMYYYY } from "@/utils/date";

pdfMake.vfs = pdfFonts.vfs;

const formatDate = (value?: string) => {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("vi-VN");
};

const formatMoney = (value?: number) => {
  return new Intl.NumberFormat("vi-VN").format(value || 0) + " đ";
};

const leaveTypeLabel = {
  FULL_DAY: "Cả ngày",
  HALF_DAY: "Nửa ngày",
};

export function printPayrollPdf(data: PayrollEmployee[]) {
  const content: TDocumentDefinitions["content"] = [];

  data.forEach((employee, index) => {
    if (index > 0) {
      content.push({ text: "", pageBreak: "before" });
    }

    content.push(
      {
        text: "BẢNG LƯƠNG NHÂN VIÊN",
        style: "title",
      },
      {
        table: {
          widths: ["35%", "65%"],
          body: [
            ["Họ và tên", employee.fullName || "-"],
            ["Chức vụ", employee.position || "-"],
            ["Mã nhân viên", employee.code || "-"],
            ["Ngày sinh", formatDateToDDMMYYYY(employee.dateOfBirth)],
            ["Số điện thoại", employee.phone || "-"],
            ["Lương cơ bản", formatMoney(employee.baseSalary)],
            ["Số ngày nghỉ", String(employee.totalLeaveDays || 0)],
            ["Tính lương từ ngày", formatDateToDDMMYYYY(employee.salaryStartDate)],
            ["Ngày nhận lương", formatDateToDDMMYYYY(employee.salaryDate)],
          ],
        },
        layout: "lightHorizontalLines",
        margin: [0, 12, 0, 16],
      },
      {
        text: "Chi tiết ngày nghỉ",
        style: "section",
      },
      {
        table: {
          headerRows: 1,
          widths: ["25%", "25%", "50%"],
          body: [
            ["Thời gian nghỉ", "Loại nghỉ", "Lý do"],
            ...(employee.leaveDetails.length
              ? employee.leaveDetails.map((item) => [
                formatDateToDDMMYYYY(item.leaveDate),
                leaveTypeLabel[item.leaveType],
                item.reason || "-",
              ])
              : [["-", "-", "Không có ngày nghỉ"]]),
          ],
        },
        layout: "lightHorizontalLines",
      }
    );
  });

  const settings = useSettingsStore.getState().settings;
  const opts: PrintOptions = settings?.printOptions || {};
  const paperSize: PaperSize = opts.paperSize ?? "A4";

  const docDefinition: TDocumentDefinitions = {
    pageSize: paperSize,
    pageOrientation: opts.pageOrientation ? opts.pageOrientation : "portrait",
    pageMargins: [40, 40, 40, 40],
    defaultStyle: {
      font: "Roboto",
      fontSize: 11,
    },
    // header: {
    //   text: `Bảng lương nhân viên ${formatDateToDDMMYYYY(data[0].salaryDate)}`,
    //   style: "header",
    //   margin: [0, 0, 0, 16],
    // },
    info: {
      title: `Bảng lương nhân viên (${formatDateToDDMMYYYY(data[0].salaryDate)})`,
      author: "CÔNG TY TNHH MTV DV TÔN THÉP TÂM ĐỨC CƯỜNG",
      subject: `Bảng lương nhân viên (${formatDateToDDMMYYYY(data[0].salaryDate)})`,
      keywords: "bảng lương, lương",
      creator: "QLBH",
      producer: "QLBH App",
      creationDate: new Date(),
      trapped: "False" as any,
    },
    
    styles: {
      title: {
        fontSize: 18,
        bold: true,
        alignment: "center",
      },
      section: {
        fontSize: 13,
        bold: true,
        margin: [0, 0, 0, 8],
      },
    },
    content,
  };

  pdfMake.createPdf(docDefinition).open();
}