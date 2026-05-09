import { Check, Copy, Download } from "lucide-react";
import { useRef, useState } from "react";
import * as htmlToImage from "html-to-image";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type InvoiceQrPaymentDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;

  bankCode: string;
  bankAccount: string;
  bankName: string;
  accountName: string;
  amount: number;
  invoiceCode: string;
};

export function InvoiceQrPaymentDialog({
  open,
  onOpenChange,
  bankCode,
  bankAccount,
  bankName,
  accountName,
  amount,
  invoiceCode,
}: InvoiceQrPaymentDialogProps) {
  const qrRef = useRef<HTMLDivElement | null>(null);

  const [copiedQr, setCopiedQr] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const qrUrl = `https://img.vietqr.io/image/${bankCode}-${bankAccount}-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(
    invoiceCode
  )}&accountName=${encodeURIComponent(accountName)}`;

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);

  const copyText = async (value: string) => {
    await navigator.clipboard.writeText(value);

    setCopiedText(value);

    setTimeout(() => {
      setCopiedText(null);
    }, 2000);
  };

  const copyQrImage = async () => {
    if (!qrRef.current) return;

    try {
      const dataUrl = await htmlToImage.toPng(qrRef.current);
      const blob = await (await fetch(dataUrl)).blob();

      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob,
        }),
      ]);

      setCopiedQr(true);

      setTimeout(() => {
        setCopiedQr(false);
      }, 2000);
    } catch (error) {
      console.error("Copy QR failed:", error);
    }
  };

  const downloadQrImage = async () => {
    if (!qrRef.current) return;

    try {
      const dataUrl = await htmlToImage.toPng(qrRef.current);

      const link = document.createElement("a");
      link.download = `invoice-${invoiceCode}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Download QR failed:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl sm:max-w-md">
        <DialogHeader className="text-center">
          <DialogTitle>Thanh toán VietQR</DialogTitle>

          <DialogDescription>
            Quét bằng ứng dụng Ngân hàng, MoMo hoặc ZaloPay
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4">
          <div ref={qrRef} className="rounded-xl border bg-white p-3">
            <img
              src={qrUrl}
              alt="VietQR thanh toán hóa đơn"
              className="h-[260px] w-[260px] object-contain"
              crossOrigin="anonymous"
              
            />
          </div>

          <div className="flex w-full gap-2">
            <Button variant="outline" className="flex-1" onClick={copyQrImage}>
              {copiedQr ? (
                <>
                  <Check className="mr-2 h-4 w-4 text-green-600" />
                  Đã sao chép
                </>
              ) : (
                <>
                  <Copy className="mr-2 h-4 w-4" />
                  Sao chép QR
                </>
              )}
            </Button>

            <Button
              variant="outline"
              className="flex-1"
              onClick={downloadQrImage}
            >
              <Download className="mr-2 h-4 w-4" />
              Tải ảnh
            </Button>
          </div>

          <div className="w-full space-y-3 rounded-xl border p-4 text-sm">
            <InfoRow label="Ngân hàng" value={bankName} />

            <InfoRow
              label="Số tài khoản"
              value={bankAccount}
              copied={copiedText === bankAccount}
              onCopy={copyText}
            />

            <InfoRow label="Chủ tài khoản" value={accountName} />

            <InfoRow label="Số tiền" value={formatCurrency(amount)} strong />

            <InfoRow
              label="Nội dung"
              value={invoiceCode}
              copied={copiedText === invoiceCode}
              onCopy={copyText}
            />
          </div>

          <Button className="w-full" onClick={() => onOpenChange(false)} variant="default">
            Đóng
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function InfoRow({
  label,
  value,
  strong,
  copied,
  onCopy,
}: {
  label: string;
  value: string;
  strong?: boolean;
  copied?: boolean;
  onCopy?: (value: string) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>

      <div className="flex items-center gap-2 text-right">
        <span
          className={strong ? "font-semibold text-destructive" : "font-medium"}
        >
          {value}
        </span>

        {onCopy && (
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7"
            onClick={() => onCopy(value)}
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-600" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>
    </div>
  );
}