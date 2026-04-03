// src/modules/sales/components/OtherExpenseCard.tsx

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NumberInput } from "@/components/ui/number-input";
import type { OtherExpenseDraft } from "../types/sales.types";

type Props = {
  value: OtherExpenseDraft;
  onChange: (value: OtherExpenseDraft) => void;
  onAdd: () => void;
  quickExpenseTemplates: Array<{ description: string; unit: string }>;
};

export function OtherExpenseCard({
  value,
  onChange,
  onAdd,
  quickExpenseTemplates,
}: Props) {
  return (
    <div className="overflow-hidden rounded-2xl border bg-white">
      <div className="border-b bg-amber-50 px-4 py-3">
        <p className="font-semibold">Chi phí khác</p>
        <p className="text-sm text-muted-foreground">
          Nhập công uốn, công nhấn máng, cắt quy cách... ngay tại cột chọn hàng
        </p>
      </div>

      <div className="space-y-4 p-4">
        <div className="flex flex-wrap gap-2">
          {quickExpenseTemplates.map((item) => (
            <button
              key={item.description}
              type="button"
              className="rounded-full border px-3 py-1 text-sm transition hover:bg-muted"
              onClick={() =>
                onChange({
                  ...value,
                  description: item.description,
                  unit: item.unit,
                })
              }
            >
              {item.description}
            </button>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium">Mô tả</label>
            <Input
              value={value.description}
              onChange={(e) => onChange({ ...value, description: e.target.value })}
              placeholder="Ví dụ: Công nhấn máng"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Chiều dài</label>
            <NumberInput
              value={value.length}
              onValueChange={(next) => onChange({ ...value, length: next })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Số lượng</label>
            <NumberInput
              value={value.quantity}
              onValueChange={(next) => onChange({ ...value, quantity: next })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Đơn giá</label>
            <NumberInput
              value={value.price}
              onValueChange={(next) => onChange({ ...value, price: next })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Đơn vị</label>
            <Input
              value={value.unit}
              onChange={(e) => onChange({ ...value, unit: e.target.value })}
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={onAdd}>Thêm chi phí</Button>
        </div>
      </div>
    </div>
  );
}