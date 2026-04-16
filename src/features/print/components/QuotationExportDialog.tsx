import { Modal, Checkbox, Input } from "antd";
import { useEffect, useMemo, useState } from "react";
import type { OrderRes } from "@/types/order";
import {
  exportQuotationExcel,
  QUOTATION_EXPORT_FIELD_OPTIONS,
  type QuotationExportFieldKey,
} from "@/features/print/services/Quotation-excel-export.service";

type Props = {
  open: boolean;
  order: OrderRes | null;
  onClose: () => void;
};

const DEFAULT_FIELDS: QuotationExportFieldKey[] = [
  "stt",
  "productName",
  "baseUnit",
  "weight",
  "unitPrice",
];

export function QuotationExportDialog({ open, order, onClose }: Props) {
  const [fields, setFields] = useState<QuotationExportFieldKey[]>(DEFAULT_FIELDS);
  const [fileName, setFileName] = useState("");

  useEffect(() => {
    if (!open || !order) return;

    setFields(DEFAULT_FIELDS);
    setFileName(order.code ? `${order.code}.xlsx` : "bao-gia.xlsx");
  }, [open, order]);

  const fieldOptions = useMemo(
    () =>
      QUOTATION_EXPORT_FIELD_OPTIONS.map((item) => ({
        label: item.label,
        value: item.value,
      })),
    []
  );

  const handleExport = () => {
    if (!order) return;
    if (!fields.length) return;

    exportQuotationExcel(order, {
      fields,
      fileName: fileName.trim() || undefined,
    });

    onClose();
  };

  return (
    <Modal
      open={open}
      title="Chọn thông tin xuất bảng báo giá"
      onCancel={onClose}
      onOk={handleExport}
      okText="Xuất Excel"
      cancelText="Đóng"
      width={720}
      destroyOnClose
    >
      <div className="space-y-4">
        <div>
          <p className="mb-2 font-medium">Tên file</p>
          <Input
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            placeholder="Nhập tên file excel"
          />
        </div>

        <div>
          <p className="mb-2 font-medium">Chọn cột cần xuất</p>
          <Checkbox.Group
            className="grid grid-cols-2 gap-2"
            options={fieldOptions}
            value={fields}
            onChange={(values) => setFields(values as QuotationExportFieldKey[])}
          />
        </div>
      </div>
    </Modal>
  );
}