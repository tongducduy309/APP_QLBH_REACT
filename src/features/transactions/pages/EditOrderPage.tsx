import { useParams } from "react-router-dom";
import { SalesPage } from "@/features/sales/pages/sales-page";

export function OrderEditPage() {
  const { id } = useParams<{ id: string }>();

  return (
    <SalesPage
      key={id}
      mode="edit"
      orderId={id}
      storageKey={id ? `sales-edit-order-${id}` : undefined}
    />
  );
}