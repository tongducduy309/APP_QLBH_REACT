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
    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
  {/* Tổng mặt hàng */}
  <Card className="bg-[#e6f4ff] border border-[#91caff] transition hover:shadow-md">
    <CardHeader>
      <CardDescription className="text-[#1677ff]">
        Tổng mặt hàng
      </CardDescription>
      <CardTitle className="text-2xl font-semibold text-[#0958d9]">
        {totalProducts}
      </CardTitle>
    </CardHeader>
  </Card>

  {/* Tổng biến thể */}
  <Card className="bg-[#f9f0ff] border border-[#d3adf7] transition hover:shadow-md">
    <CardHeader>
      <CardDescription className="text-[#722ed1]">
        Tổng biến thể
      </CardDescription>
      <CardTitle className="text-2xl font-semibold text-[#531dab]">
        {totalVariantCount}
      </CardTitle>
    </CardHeader>
  </Card>

  {/* Sắp hết */}
  <Card className="bg-[#fff7e6] border border-[#ffd591] transition hover:shadow-md">
    <CardHeader>
      <CardDescription className="text-[#fa8c16]">
        Sắp hết hàng
      </CardDescription>
      <CardTitle className="text-2xl font-semibold text-[#d46b08]">
        {lowStockCount}
      </CardTitle>
    </CardHeader>
  </Card>

  {/* Hết hàng */}
  <Card className="bg-[#fff1f0] border border-[#ffa39e] transition hover:shadow-md">
    <CardHeader>
      <CardDescription className="text-[#ff4d4f]">
        Hết hàng
      </CardDescription>
      <CardTitle className="text-2xl font-semibold text-[#cf1322]">
        {outOfStockCount}
      </CardTitle>
    </CardHeader>
  </Card>
</div>
  );
}