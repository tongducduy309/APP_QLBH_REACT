// src/modules/sales/components/PaymentSummaryCard.tsx

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { EllipsisVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";

type Props = {
  shippingFee: number;
  taxPercent: number;
  paidAmount: number;
  productSubtotal: number;
  otherExpenseSubtotal: number;
  taxAmount: number;
  grandTotal: number;
  remainingAmount: number;
  changeAmount: number;
  onChangeShippingFee: (value: number) => void;
  onChangeTaxPercent: (value: number) => void;
  onChangePaidAmount: (value: number) => void;
  onReset: () => void;
  onCheckout: () => void;
  checkoutDisabled?: boolean;
  checkoutLoading?: boolean;
  checkedPrintInvoice?: boolean;
  onCheckedPrintInvoice: (value: boolean) => void;
  onDownloadQuote: () => void;
  onSaveDraft: () => void;

  editMode?: boolean;
  checkoutLabel?: string;
  checkoutLoadingLabel?: string;
  saveDraftLabel?: string;
  printInvoiceLabel?: string;
  
};

export function PaymentSummaryCard(props: Props) {
  const checkoutLabel =
    props.checkoutLabel ?? (props.editMode ? "Lưu hóa đơn" : "Thanh toán");

  const checkoutLoadingLabel =
    props.checkoutLoadingLabel ??
    (props.editMode ? "Đang lưu hóa đơn..." : "Đang thanh toán...");

  const saveDraftLabel =
    props.saveDraftLabel ?? (props.editMode ? "Lưu bản nháp chỉnh sửa" : "Lưu nháp");


  const printInvoiceLabel =
    props.printInvoiceLabel ??
    (props.editMode ? "In hóa đơn sau khi lưu" : "In hóa đơn khi thanh toán");

  return (
    <>
      <div className="my-4 grid gap-4 border-t pt-2 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium">Phí vận chuyển</label>
          <Input
            type="number"
            min={0}
            value={props.shippingFee}
            onChange={(e) => props.onChangeShippingFee(Number(e.target.value) || 0)}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Thuế GTGT (%)</label>
          <Input
            type="number"
            min={0}
            value={props.taxPercent}
            onChange={(e) => props.onChangeTaxPercent(Number(e.target.value) || 0)}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Tiền khách thanh toán</label>
          <Input
            type="number"
            min={0}
            value={props.paidAmount}
            onChange={(e) => props.onChangePaidAmount(Number(e.target.value) || 0)}
          />
        </div>
      </div>

      <div className="rounded-2xl bg-slate-50 p-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-muted-foreground">Tiền hàng</span>
          <span className="font-semibold">{formatCurrency(props.productSubtotal)}</span>
        </div>

        <div className="mb-2 flex items-center justify-between">
          <span className="text-muted-foreground">Chi phí khác</span>
          <span className="font-semibold">
            {formatCurrency(props.otherExpenseSubtotal)}
          </span>
        </div>

        <div className="mb-2 flex items-center justify-between">
          <span className="text-muted-foreground">Phí vận chuyển</span>
          <span className="font-semibold">{formatCurrency(props.shippingFee)}</span>
        </div>

        <div className="mb-2 flex items-center justify-between">
          <span className="text-muted-foreground">
            Thuế GTGT ({props.taxPercent}%)
          </span>
          <span className="font-semibold">{formatCurrency(props.taxAmount)}</span>
        </div>

        <div className="mb-2 flex items-center justify-between border-t pt-2">
          <span className="font-medium">Tổng thanh toán</span>
          <span className="text-lg font-bold">{formatCurrency(props.grandTotal)}</span>
        </div>

        <div className="mb-2 flex items-center justify-between">
          <span className="text-muted-foreground">Đã thanh toán</span>
          <span className="font-semibold">{formatCurrency(props.paidAmount)}</span>
        </div>

        <div className="mb-2 flex items-center justify-between">
          <span className="text-muted-foreground">Còn lại</span>
          <span className="font-semibold">{formatCurrency(props.remainingAmount)}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Tiền thừa</span>
          <span className="font-semibold">{formatCurrency(props.changeAmount)}</span>
        </div>
      </div>

      <label className="inline-flex w-full cursor-pointer items-center gap-3 rounded-md border px-3 py-3 text-sm font-medium transition-all">
        <Checkbox
          checked={props.checkedPrintInvoice}
          onCheckedChange={(checked) =>
            props.onCheckedPrintInvoice(Boolean(checked))
          }
        />
        <span>{printInvoiceLabel}</span>
      </label>

      <div className="flex w-full items-center gap-3">
        <div className={`grid w-full gap-3 ${props.editMode ? "md:grid-cols-1" : "md:grid-cols-2"}`}>
          {
            !props.editMode && (
              <Button variant="outline" className="w-full" onClick={props.onReset}>
                Làm mới đơn
              </Button>
            )
          }

          <Button onClick={props.onCheckout} disabled={props.checkoutDisabled}>
            {props.checkoutLoading ? checkoutLoadingLabel : checkoutLabel}
          </Button>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <EllipsisVertical />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuGroup>
              <DropdownMenuItem
                onClick={props.onDownloadQuote}
                disabled={props.checkoutDisabled}
              >
                Tải bảng báo giá
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={props.onSaveDraft}
                disabled={props.checkoutDisabled}
              >
                {saveDraftLabel}
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );
}