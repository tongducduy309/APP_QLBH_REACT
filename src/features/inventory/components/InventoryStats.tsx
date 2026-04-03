// src/modules/inventory/components/InventoryStats.tsx

import { Card, CardHeader, CardDescription, CardTitle } from "@/components/ui/card";

type Props = {
  totalProducts: number;
  totalVariantCount: number;
  lowStockCount: number;
  outOfStockCount: number;
};

export function InventoryStats({
  totalProducts,
  totalVariantCount,
  lowStockCount,
  outOfStockCount,
}: Props) {
  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card>
        <CardHeader>
          <CardDescription>Tổng mặt hàng</CardDescription>
          <CardTitle>{totalProducts}</CardTitle>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardDescription>Tổng biến thể</CardDescription>
          <CardTitle>{totalVariantCount}</CardTitle>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardDescription>Sắp hết hàng</CardDescription>
          <CardTitle>{lowStockCount}</CardTitle>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardDescription>Hết hàng</CardDescription>
          <CardTitle>{outOfStockCount}</CardTitle>
        </CardHeader>
      </Card>
    </div>
  );
}