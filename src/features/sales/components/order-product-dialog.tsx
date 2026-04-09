
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { NumberInput } from "@/components/ui/number-input";
import { Plus, TriangleAlert, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useEffect, useMemo, useRef, useState } from "react";
import { getEffectiveQuantity } from "../utils/sales-calculations";
import { OrderedProduct } from "../types/sales.types";

type ProductType = "A" | "B" | "C" | "D";
type PriceMode = "A" | "B";

export type InventoryRes = {
  id?: number | null;
  variantId?: number | null;
  inventoryId?: number | null;
  name?: string;
  variantCode?: string;
  baseUnit?: string;
  retailPrice?: number;
  storePrice?: number;
  cost?: number;
  stock?: number;
};

type OrderSizeLine = {
  id: string;
  length: number;
  quantity: number;
};

type OrderForm = {
  type: ProductType;
  curving: {
    enabled: boolean;
    price: number;
    description: string;
  };
  flatSheet: {
    hasGroove: boolean;
    panelCount: number;
    width: number;
    panelSizes: number[];
  };
  price: number;
};

export type EditableOrderedGroup = {
  name: string;
  unit: string;
  price: number;
  productId: number | null;
  variantId?: number | null;
  inventoryId?: number | null;
  sizeLines: Array<{
    length: number;
    quantity: number;
  }>;
};

type OrderProductDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Partial<InventoryRes>;
  onOrder: (orders: OrderedProduct[]) => void;
  editValue?: EditableOrderedGroup | null;
};

const createInitialForm = (product?: Partial<InventoryRes>): OrderForm => ({
  type: "A",
  curving: {
    enabled: false,
    price: 0,
    description: "",
  },
  flatSheet: {
    hasGroove: false,
    panelCount: 1,
    width: 120,
    panelSizes: [120],
  },
  price: product?.retailPrice ?? 0,
});

const createSizeLine = (length = 0, quantity = 1): OrderSizeLine => ({
  id: crypto.randomUUID(),
  length,
  quantity,
});

function clampWidth(value: number) {
  if (!Number.isFinite(value)) return 120;
  if (value <= 0) return 1;
  return Math.min(value, 120);
}

function buildPanelSizes(width: number, panelCount: number) {
  const safeCount = Math.max(1, Math.min(3, panelCount));
  const each = Number((width / safeCount).toFixed(2));
  return Array.from({ length: safeCount }, () => each);
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

export function OrderProductDialog({
  open,
  onOpenChange,
  product,
  onOrder,
  editValue,
}: OrderProductDialogProps) {
  const [form, setForm] = useState<OrderForm>(() => createInitialForm(product));
  const [priceMode, setPriceMode] = useState<PriceMode>("A");
  const [unit, setUnit] = useState(product?.baseUnit ?? "");
  const [sizeLines, setSizeLines] = useState<OrderSizeLine[]>([createSizeLine()]);
  const [productName, setProductName] = useState("");
  const [isProductNameManuallyEdited, setIsProductNameManuallyEdited] =
    useState(false);

  const [isOverStockDialogOpen, setIsOverStockDialogOpen] = useState(false);
  const [allowOutsideStock, setAllowOutsideStock] = useState(false);

  const [checkStock, setCheckStock] = useState<boolean>(true);

  const lengthRefs = useRef<Record<string, HTMLInputElement | null>>({});

  

  useEffect(() => {
    if (!open) return;

    if (editValue) {
      setForm((prev) => ({
        ...prev,
        price: editValue.price,
      }));
      setPriceMode("A");
      setUnit(editValue.unit || product?.baseUnit || "");
      setSizeLines(
        editValue.sizeLines.length > 0
          ? editValue.sizeLines.map((item) =>
              createSizeLine(item.length || 0, item.quantity || 1)
            )
          : [createSizeLine()]
      );
      setProductName(editValue.name || "");
      setIsProductNameManuallyEdited(true);
      setAllowOutsideStock(false);
      setIsOverStockDialogOpen(false);
      setCheckStock(product?.inventoryId !== null&&product?.inventoryId !== undefined&&product?.inventoryId !== 0);
      console.log(checkStock);

      setTimeout(() => {
        const first = editValue.sizeLines[0];
        if (!first) return;
        const firstKey = Object.keys(lengthRefs.current)[0];
        if (firstKey) lengthRefs.current[firstKey]?.focus();
      }, 0);

      return;
    }

    setForm(createInitialForm(product));
    setPriceMode("A");
    setUnit(product?.baseUnit ?? "");
    const firstLine = createSizeLine();
    setSizeLines([firstLine]);
    setProductName(defaultComputedName);
    setIsProductNameManuallyEdited(false);
    setAllowOutsideStock(false);
    setIsOverStockDialogOpen(false);
    
    setTimeout(() => {
      lengthRefs.current[firstLine.id]?.focus();
    }, 0);
  }, [open, product, editValue]);

  useEffect(() => {
    if (editValue) return;

    setForm((prev) => ({
      ...prev,
      price:
        priceMode === "A"
          ? product?.retailPrice ?? 0
          : product?.storePrice ?? 0,
    }));
  }, [priceMode, product?.retailPrice, product?.storePrice, editValue]);

  const defaultComputedName = useMemo(() => {
    let name = `${product?.name ?? ""}${
      product?.variantCode ? ` (${product.variantCode})` : ""
    }`;

    if (form.type === "B") name += " Sóng Vuông";
    if (form.type === "C") name += " Sóng La Phông";

    if ((form.type === "B" || form.type === "C") && form.curving.enabled) {
      name += " Uốn Vòm";
    }

    if (form.type === "D") {
      const joinedSizes = form.flatSheet.panelSizes.join("x");

      if (form.flatSheet.hasGroove) {
        name += ` (Nhấn Máng ${joinedSizes})`;
      } else if (form.flatSheet.panelCount > 1) {
        name += ` (Xẻ ${joinedSizes})`;
      } else {
        name += ` (Phẳng Khổ ${form.flatSheet.panelSizes[0]}cm)`;
      }
    }

    return name.trim();
  }, [product?.name, product?.variantCode, form]);

  useEffect(() => {
    if (!editValue && !isProductNameManuallyEdited) {
      setProductName(defaultComputedName);
    }
  }, [defaultComputedName, isProductNameManuallyEdited, editValue]);

  const computedUnitPrice = useMemo(() => {
    if (form.type === "D") {
      return Number(((form.flatSheet.width * form.price) / 120).toFixed(2));
    }
    return form.price;
  }, [form]);

  const availableStock = useMemo(() => Number(product?.stock ?? 0), [product?.stock]);

  const profitAmount = useMemo(() => {
    return Number(computedUnitPrice || 0) - Number(product?.cost || 0);
  }, [computedUnitPrice, product?.cost]);

  const subtotal = useMemo(() => {
  return sizeLines.reduce((sum, line) => {
    const lineTotal =
      getEffectiveQuantity({
        quantity: line.quantity,
        length: line.length,
      }) * Number(computedUnitPrice || 0);

    return sum + lineTotal;
  }, 0);
}, [sizeLines, computedUnitPrice]);

  const totalQuantity = useMemo(() => {
  return sizeLines.reduce(
    (sum, line) =>
      sum +
      getEffectiveQuantity({
        quantity: line.quantity,
        length: line.length,
      }),
    0
  );
}, [sizeLines]);

  const exceededQuantity = useMemo(() => {
    return Math.max(0, totalQuantity - availableStock);
  }, [totalQuantity, availableStock]);

  const isOverStock = useMemo(() => {
    return totalQuantity > availableStock;
  }, [totalQuantity, availableStock]);

  const addSizeLine = () => {
    const newLine = createSizeLine();

    setSizeLines((prev) => [...prev, newLine]);

    setTimeout(() => {
      lengthRefs.current[newLine.id]?.focus();
    }, 0);
  };

  const updateSizeLine = (lineId: string, nextLine: OrderSizeLine) => {
    setSizeLines((prev) =>
      prev.map((line) => (line.id === lineId ? nextLine : line))
    );
  };

  const removeSizeLine = (lineId: string) => {
    setSizeLines((prev) => {
      const nextLines = prev.filter((line) => line.id !== lineId);

      if (nextLines.length > 0) {
        setTimeout(() => {
          const lastLine = nextLines[nextLines.length - 1];
          lengthRefs.current[lastLine.id]?.focus();
        }, 0);
      }

      return nextLines;
    });
  };

  const setProductType = (type: ProductType) => {
    setForm((prev) => ({
      ...prev,
      type,
    }));
  };

  const setCurvingEnabled = (enabled: boolean) => {
    setForm((prev) => ({
      ...prev,
      curving: {
        ...prev.curving,
        enabled,
      },
    }));
  };

  const setCurvingPrice = (price: number) => {
    setForm((prev) => ({
      ...prev,
      curving: {
        ...prev.curving,
        price,
      },
    }));
  };

  const setFlatSheetGroove = (hasGroove: boolean) => {
    setForm((prev) => ({
      ...prev,
      flatSheet: {
        ...prev.flatSheet,
        hasGroove,
      },
    }));
  };

  const setFlatSheetWidth = (value: number) => {
    const safeWidth = clampWidth(value);

    setForm((prev) => ({
      ...prev,
      flatSheet: {
        ...prev.flatSheet,
        width: safeWidth,
        panelSizes: buildPanelSizes(safeWidth, prev.flatSheet.panelCount),
      },
    }));
  };

  const setFlatSheetPanelCount = (panelCount: number) => {
    const safeCount = Math.max(1, Math.min(3, panelCount));

    setForm((prev) => ({
      ...prev,
      flatSheet: {
        ...prev.flatSheet,
        panelCount: safeCount,
        panelSizes: buildPanelSizes(prev.flatSheet.width, safeCount),
      },
    }));
  };

  const setFlatSheetPanelSizeAt = (index: number, value: number) => {
    setForm((prev) => {
      const nextPanelSizes = [...prev.flatSheet.panelSizes];
      nextPanelSizes[index] = Number.isFinite(value) ? value : 0;

      return {
        ...prev,
        flatSheet: {
          ...prev.flatSheet,
          panelSizes: nextPanelSizes,
        },
      };
    });
  };

  const validateForm = () => {
    if (!product?.id && !editValue?.productId) {
      toast.error("Không tìm thấy sản phẩm.");
      return false;
    }

    if (!productName.trim()) {
      toast.error("Tên sản phẩm không hợp lệ.");
      return false;
    }

    if (computedUnitPrice < 0) {
      toast.error("Đơn giá không hợp lệ.");
      return false;
    }

    if (
      (form.type === "B" || form.type === "C") &&
      form.curving.enabled &&
      form.curving.price < 0
    ) {
      toast.error("Đơn giá uốn vòm không hợp lệ.");
      return false;
    }

    if (form.type === "D") {
      if (form.flatSheet.width <= 0 || form.flatSheet.width > 120) {
        toast.error("Khổ phải nằm trong khoảng 1 - 120 cm.");
        return false;
      }

      if (form.flatSheet.panelSizes.some((size) => size <= 0)) {
        toast.error("Kích thước tấm phải lớn hơn 0.");
        return false;
      }
    }

    if (sizeLines.length === 0) {
      toast.error("Phải có ít nhất một dòng kích thước.");
      return false;
    }

    for (const line of sizeLines) {
      if (line.length && line.length <= 0) {
        toast.error("Chiều dài phải lớn hơn 0.");
        return false;
      }

      if (line.quantity <= 0) {
        toast.error("Số lượng phải lớn hơn 0.");
        return false;
      }
    }

    return true;
  };

  const submitOrders = () => {
    const orders: OrderedProduct[] = sizeLines.map((line) => ({
      kind: allowOutsideStock?"NON_INVENTORY":"INVENTORY",
      name: productName.trim(),
      unit: unit || "",
      price: computedUnitPrice,
      length: Number(line.length || 0),
      quantity: Number(line.quantity || 0),
      productId: product?.id ?? editValue?.productId ?? null,
      variantId: product?.variantId ?? editValue?.variantId ?? null,
      inventoryId: product?.inventoryId ?? editValue?.inventoryId ?? null,
    }));

    if ((form.type === "B" || form.type === "C") && form.curving.enabled) {
      const totalCurvingQty = sizeLines.reduce(
        (sum, line) => sum + Number(line.quantity || 0),
        0
      );

      orders.push({
        
        kind: "EXPENSE",
        name: "Công Uốn Vòm",
        unit: "tấm",
        price: form.curving.price || 0,
        length: null,
        quantity: totalCurvingQty,
        productId: null,
        variantId: null,
        inventoryId: null,
      });
    }

    onOrder(orders);
    toast.success(editValue ? "Đã cập nhật sản phẩm." : "Đã thêm sản phẩm.");
    onOpenChange(false);
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    if (checkStock&&isOverStock && !allowOutsideStock) {
      setIsOverStockDialogOpen(true);
      return;
    }

    submitOrders();
  };

  const handleConfirmOutsideStock = () => {
    if (!allowOutsideStock) {
      toast.error("Bạn cần xác nhận lấy hàng ngoài kho.");
      return;
    }

    setIsOverStockDialogOpen(false);
    submitOrders();
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className="flex max-h-[92vh] flex-col overflow-hidden p-0 sm:max-w-5xl"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <DialogHeader className="shrink-0 border-b px-6 py-4">
            <DialogTitle>{editValue ? "Chỉnh sửa sản phẩm" : "Đặt hàng"}</DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-6 py-5">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="product-name">Tên sản phẩm</Label>
                <div className="flex gap-2">
                  <Input
                    id="product-name"
                    value={productName}
                    onChange={(e) => {
                      setProductName(e.target.value);
                      setIsProductNameManuallyEdited(true);
                    }}
                  />
            
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setProductName(defaultComputedName);
                        setIsProductNameManuallyEdited(false);
                      }}
                    >
                      Tự động
                    </Button>
                
                </div>
              </div>

           
                <>
                  <div className="space-y-3">
                    <Label>Loại sản phẩm</Label>
                    <RadioGroup
                      value={form.type}
                      onValueChange={(value) => setProductType(value as ProductType)}
                      className="grid grid-cols-2 gap-2 md:grid-cols-4"
                    >
                      <label className="flex items-center gap-2 rounded-md border p-3">
                        <RadioGroupItem value="A" id="type-a" />
                        <span>Không</span>
                      </label>
                      <label className="flex items-center gap-2 rounded-md border p-3">
                        <RadioGroupItem value="B" id="type-b" />
                        <span>Sóng Vuông</span>
                      </label>
                      <label className="flex items-center gap-2 rounded-md border p-3">
                        <RadioGroupItem value="C" id="type-c" />
                        <span>Sóng La Phông</span>
                      </label>
                      <label className="flex items-center gap-2 rounded-md border p-3">
                        <RadioGroupItem value="D" id="type-d" />
                        <span>Phẳng</span>
                      </label>
                    </RadioGroup>
                  </div>

                  {(form.type === "B" || form.type === "C") && (
                    <div className="space-y-4 rounded-lg border p-4">
                      <div className="flex items-center gap-3">
                        <Checkbox
                          id="curving"
                          checked={form.curving.enabled}
                          onCheckedChange={(checked) =>
                            setCurvingEnabled(Boolean(checked))
                          }
                        />
                        <Label htmlFor="curving">Uốn vòm</Label>
                      </div>

                      {form.curving.enabled && (
                        <div className="space-y-2">
                          <Label htmlFor="curving-price">Đơn giá uốn vòm</Label>
                          <NumberInput
                            id="curving-price"
                            value={form.curving.price}
                            onValueChange={setCurvingPrice}
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {form.type === "D" && (
                    <div className="space-y-4 rounded-lg border p-4">
                      <div className="flex items-center gap-3">
                        <Checkbox
                          id="has-groove"
                          checked={form.flatSheet.hasGroove}
                          onCheckedChange={(checked) =>
                            setFlatSheetGroove(Boolean(checked))
                          }
                        />
                        <Label htmlFor="has-groove">Nhấn máng</Label>
                      </div>

                      <div className="grid gap-4 md:grid-cols-3">
                        <div className="space-y-2">
                          <Label>Khổ / 120 cm</Label>
                          <NumberInput
                            value={form.flatSheet.width}
                            onValueChange={setFlatSheetWidth}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Số tấm</Label>
                          <select
                            className="h-10 w-full rounded-md border bg-background px-3"
                            value={form.flatSheet.panelCount}
                            onChange={(e) =>
                              setFlatSheetPanelCount(Number(e.target.value))
                            }
                          >
                            <option value={1}>1</option>
                            <option value={2}>2</option>
                            <option value={3}>3</option>
                          </select>
                        </div>

                        <div className="space-y-2 md:col-span-3">
                          <Label>Kích thước từng tấm (cm)</Label>
                          <div
                            className={`grid gap-2 ${
                              form.flatSheet.panelCount === 1
                                ? "grid-cols-1"
                                : form.flatSheet.panelCount === 2
                                ? "grid-cols-2"
                                : "grid-cols-3"
                            }`}
                          >
                            {form.flatSheet.panelSizes.map((panelSize, index) => (
                              <NumberInput
                                key={index}
                                value={panelSize}
                                onValueChange={(value) =>
                                  setFlatSheetPanelSizeAt(index, value)
                                }
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    <Label>Loại giá</Label>
                    <RadioGroup
                      value={priceMode}
                      onValueChange={(value) => setPriceMode(value as PriceMode)}
                      className="grid grid-cols-2 gap-2"
                    >
                      <label className="flex items-center gap-2 rounded-md border p-3">
                        <RadioGroupItem value="A" id="price-a" />
                        <span>Giá bán lẻ</span>
                      </label>
                      <label className="flex items-center gap-2 rounded-md border p-3">
                        <RadioGroupItem value="B" id="price-b" />
                        <span>Giá cửa hàng</span>
                      </label>
                    </RadioGroup>
                  </div>
                </>
          

              <div className="grid gap-4 md:grid-cols-[1fr_140px]">
                <div className="space-y-2">
                  <Label htmlFor="price">Đơn giá</Label>
                  <NumberInput
                    id="price"
                    value={form.price}
                    onValueChange={(value) =>
                      setForm((prev) => ({
                        ...prev,
                        price: value,
                      }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="unit">Đơn vị</Label>
                  <Input
                    id="unit"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">Danh sách kích thước đặt hàng</p>
                    <p className="text-sm text-muted-foreground">
                      Có thể thêm nhiều dòng chiều dài và số lượng khác nhau
                    </p>
                  </div>

                  <Button type="button" variant="outline" onClick={addSizeLine}>
                    <Plus className="mr-2 h-4 w-4" />
                    Thêm kích thước
                  </Button>
                </div>

                <div className="space-y-4">
                  {sizeLines.map((line) => {
                    const lineTotal =
                      Number(line.length || 0) *
                      Number(line.quantity || 0) *
                      Number(computedUnitPrice || 0);

                    return (
                      <div key={line.id} className="rounded-xl border p-4">
                        <div className="grid gap-4 md:grid-cols-[1fr_1fr_1fr_auto] md:items-end">
                          <div className="space-y-2">
                            <Label>Chiều dài</Label>
                            <NumberInput
                              ref={(el) => {
                                lengthRefs.current[line.id] = el;
                              }}
                              value={line.length}
                              onValueChange={(value) =>
                                updateSizeLine(line.id, {
                                  ...line,
                                  length: value,
                                })
                              }
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Số lượng</Label>
                            <NumberInput
                              value={line.quantity}
                              onValueChange={(value) =>
                                updateSizeLine(line.id, {
                                  ...line,
                                  quantity: value,
                                })
                              }
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Thành tiền</Label>
                            <Input value={formatCurrency(lineTotal)} readOnly />
                          </div>

                          <div className="flex md:justify-end">
                            <Button
                              type="button"
                              variant="ghost"
                              onClick={() => removeSizeLine(line.id)}
                              disabled={sizeLines.length === 1}
                              className="text-red-500 hover:text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="shrink-0 border-t bg-background px-6 py-4 shadow-[0_-6px_16px_rgba(0,0,0,0.06)]">
            <div className="space-y-2 rounded-lg border bg-muted/30 p-4 text-sm">
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">Tên hiển thị</span>
                <span className="text-right font-medium">{productName || "-"}</span>
              </div>

              {
                checkStock && (
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-muted-foreground">Tồn kho hiện tại</span>
                    <span className="font-medium">{availableStock}</span>
                  </div>
                )
              }

              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">Tổng số lượng</span>
                <span className={isOverStock&&checkStock ? "font-medium text-red-600" : "font-medium"}>
                  {totalQuantity} {isOverStock&&checkStock ? `(+${exceededQuantity} Vượt tồn kho)` : ""}
                </span>
              </div>


              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">Giá vốn chênh lệch</span>
                <span
                  className={
                    profitAmount >= 0
                      ? "font-medium text-emerald-600"
                      : "font-medium text-red-600"
                  }
                >
                  {formatCurrency(profitAmount)}
                </span>
              </div>

              {/* <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">Đơn giá thực tế khi lưu</span>
                <span className="font-semibold">
                  {formatCurrency(computedUnitPrice)}
                </span>
              </div> */}

              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">Tạm tính</span>
                <span className="font-semibold">{formatCurrency(subtotal)}</span>
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Hủy
              </Button>
              <Button onClick={handleSubmit}>
                {editValue ? "Lưu chỉnh sửa" : "Đặt hàng"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isOverStockDialogOpen} onOpenChange={setIsOverStockDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <TriangleAlert className="h-5 w-5" />
              Số lượng vượt quá tồn kho
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm">
              <p className="font-medium text-red-700">
                Sản phẩm này không đủ tồn kho để đáp ứng đơn hàng.
              </p>

              <div className="mt-3 space-y-2 text-foreground">
                <div className="flex items-center justify-between">
                  <span>Tồn kho hiện tại</span>
                  <span className="font-medium">{availableStock}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Tổng số lượng đặt</span>
                  <span className="font-medium">{totalQuantity}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Số lượng thiếu</span>
                  <span className="font-medium text-red-600">
                    {exceededQuantity}
                  </span>
                </div>
              </div>
            </div>

            <label
              htmlFor="allow-outside-stock"
              className={`inline-flex w-full cursor-pointer items-center gap-3 rounded-md border px-3 py-3 text-sm font-medium transition-all ${
                allowOutsideStock
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-background hover:bg-muted"
              }`}
            >
              <Checkbox
                id="allow-outside-stock"
                checked={allowOutsideStock}
                onCheckedChange={(checked) => setAllowOutsideStock(Boolean(checked))}
              />
              <span>Tôi xác nhận lấy hàng ngoài kho cho phần thiếu này</span>
            </label>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsOverStockDialogOpen(false);
                  setAllowOutsideStock(false);
                }}
              >
                Quay lại
              </Button>
              <Button
                onClick={handleConfirmOutsideStock}
                disabled={!allowOutsideStock}
              >
                Xác nhận tiếp tục
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}