import { Outlet, useNavigate } from "react-router-dom";
import { AppHeader } from "@/components/layout/app-header";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { useCallback, useEffect, useState } from "react";
import { cleanupExpiredOrderStorage } from "@/utils/order-storage-cleanup";
import { ConfirmPasswordProvider } from "@/app/providers/confirm-password-provider";
import { ConfirmActionProvider } from "@/app/providers/confirm-action-provider";
import { toast } from "sonner";
import { formatCurrency } from "@/features/sales/lib/order-product.helpers";
import { BankTransferNotification } from "@/features/transactions/types/bank.types";
import { useBankTransfer } from "@/app/websocket/useBankTransfer";

export function MainLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const onBankTransfer = useCallback((data: BankTransferNotification) => {
    toast.info(
      <div className="space-y-1 text-sm pl-3" onClick={() => navigate(`/transactions/bank-transfer/${data.id}`)}>

        <div className="font-semibold">Đã nhận thông báo chuyển khoản</div>
        <div>Số tiền: {formatCurrency(data.transferAmount)}</div>
        <div>Số tài khoản: {data.accountNumber}</div>
        {data.bankAccountName ? (
          <div>Chủ tài khoản: {data.bankAccountName}</div>
        ) : null}
        {data.bankName ? <div>Ngân hàng: {data.bankName}</div> : null}
        {data.description ? <div>Mô tả: {data.description}</div> : null}
      </div>
    ,{duration: 8000,cancel: true,icon:null});
  }, []);

  useEffect(() => {
    const result = cleanupExpiredOrderStorage();

    if (result.removedKeys.length > 0) {
      console.log("[order-storage] Đã xóa draft hết hạn:", result.removedKeys);
    }
  }, []);

  const {ready} = useBankTransfer({ onBankTransfer });





  return (
    <ConfirmActionProvider>
      <ConfirmPasswordProvider>
        <div className="h-screen overflow-hidden bg-slate-50">
          <div className="flex h-full">
            <div className="shrink-0">
              <AppSidebar
                collapsed={collapsed}
                onToggle={() => setCollapsed((prev) => !prev)}
                mobileOpen={mobileOpen}
                onMobileClose={() => setMobileOpen(false)}
              />
            </div>

            <div className="flex h-full min-w-0 flex-1 flex-col">
              <div className="shrink-0">
                {!ready && (
                  <div className="flex items-center justify-center bg-yellow-100 text-yellow-800 p-2">
                    Đang kết nối WebSocket... 
                  </div>
                )}
                <AppHeader onOpenMobileMenu={() => setMobileOpen(true)} />
              </div>

              <main className="min-h-0 flex-1 overflow-y-auto">
                <Outlet />
              </main>
            </div>
          </div>
        </div>
      </ConfirmPasswordProvider>
    </ConfirmActionProvider>


  );
}