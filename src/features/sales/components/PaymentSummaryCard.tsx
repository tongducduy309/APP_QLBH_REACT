// src/modules/sales/components/PaymentSummaryCard.tsx

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

type Props = {
  shippingFee: number;
  taxPercent: number;
  discount: number;
  paidAmount: number;
  productSubtotal: number;
  otherExpenseSubtotal: number;
  taxAmount: number;
  grandTotal: number;
  remainingAmount: number;
  changeAmount: number;
  onChangeShippingFee: (value: number) => void;
  onChangeTaxPercent: (value: number) => void;
  onChangeDiscount: (value: number) => void;
  onChangePaidAmount: (value: number) => void;
  onReset: () => void;
  onCheckout: () => void;
};

export function PaymentSummaryCard(props: Props) {
  return (
    <>
      <div className="my-4 grid gap-4 border-t pt-2 md:grid-cols-2 ">
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
          <label className="text-sm font-medium">Giảm giá</label>
          <Input
            type="number"
            min={0}
            value={props.discount}
            onChange={(e) => props.onChangeDiscount(Number(e.target.value) || 0)}
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
          <span className="text-muted-foreground">Giảm giá</span>
          <span className="font-semibold">- {formatCurrency(props.discount)}</span>
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

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <Button variant="outline" className="w-full" onClick={props.onReset}>
          Làm mới đơn
        </Button>

        <Button className="w-full" onClick={props.onCheckout}>
          Thanh toán
        </Button>
      </div>
    </>
  );
}