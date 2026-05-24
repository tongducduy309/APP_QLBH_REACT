import { Check, Copy, Download} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import * as htmlToImage from "html-to-image";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { FieldLabel, Field, FieldContent, FieldTitle, FieldDescription } from "@/components/ui/field";
import { BankAccount } from "../types/bank.types";
import { getBankAccounts } from "@/services/bank-account-api";


const initialBankAccounts: BankAccount[] = [
  {
    id: "1",
    bankCode: "Sacombank",
    accountNumber: "060280886699",
    bankName: "Sacombank",
    bankAccountName: "NGUYỄN HOÀNG ANH",
    active: true,
    isDefault: true,
  },
  {
    id: "2",
    bankCode: "VPBank",
    accountNumber: "060280886699",
    bankName: "VPBank",
    bankAccountName: "NGUYỄN HOÀNG ANH",
    active: true,
    isDefault: false,
  },
];

type InvoiceQrPaymentDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  amount: number;
  invoiceCode: string;
};

export function InvoiceQrPaymentDialog({
  open,
  onOpenChange,
  amount,
  invoiceCode,
}: InvoiceQrPaymentDialogProps) {
  const qrRef = useRef<HTMLDivElement | null>(null);

  const [copiedQr, setCopiedQr] = useState(false);
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);

  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>(initialBankAccounts);
  const [selectedAccountId, setSelectedAccountId] = useState<string>();

  const selectedAccount = useMemo(() => {
    return bankAccounts.find((item) => item.id === selectedAccountId) ?? null;
  }, [bankAccounts, selectedAccountId]);

  const sortedBankAccounts = useMemo(() => {
    return [...bankAccounts].sort((a, b) => {
      if (a.isDefault) return -1;
      if (b.isDefault) return 1;
      return 0;
    });
  }, [bankAccounts]);

  const qrUrl = useMemo(() => {
    if (!selectedAccount) return "";

    const bankCode = encodeURIComponent(selectedAccount.bankCode);
    const bankAccount = encodeURIComponent(selectedAccount.accountNumber);
    const accountName = encodeURIComponent(selectedAccount.bankAccountName);

    return `https://img.vietqr.io/image/${bankCode}-${bankAccount}-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(
      invoiceCode
    )}&accountName=${accountName}`;
  }, [selectedAccount, amount, invoiceCode]);



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

  useEffect(() => {
    if (open) {
      setCurrentStep(1);
      getBankAccounts().then((accounts) => {
        setBankAccounts(accounts);
        if (accounts.length > 0) {
          setSelectedAccountId(accounts.find((item) => item.isDefault)?.id ?? accounts[0].id);
        }
      });
    }
  }, [open]);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center">
          <DialogTitle>Thanh toán VietQR - Bước {currentStep}/2</DialogTitle>
          <DialogDescription>
            {currentStep === 1 
              ? "Chọn tài khoản ngân hàng để thanh toán"
              : "Quét mã QR để thanh toán"
            }
          </DialogDescription>
        </DialogHeader>

        {/* Step 1: Select Bank Account */}
        {currentStep === 1 && (
          <div className="flex flex-col gap-3">

            <div className="relative">
              {sortedBankAccounts.length === 0 ? (
                <div className="flex items-center justify-center h-[380px]">
                  <p className="text-sm text-muted-foreground">
                    Chưa có tài khoản ngân hàng
                  </p>
                </div>
              ) : (
                <>
                  <div className="pointer-events-none absolute top-0 z-10 h-6 w-full bg-gradient-to-b from-background to-transparent" />
                  <div className="pointer-events-none absolute bottom-0 z-10 h-6 w-full bg-gradient-to-t from-background to-transparent" />
                  <div className="max-h-[380px] overflow-y-auto pr-2 py-3">
                    <RadioGroup
                      value={selectedAccountId}
                      onValueChange={setSelectedAccountId}
                      className="space-y-1"
                    >
                      {sortedBankAccounts.map((account) => (
                        <FieldLabel
                          key={account.id}
                          htmlFor={account.id}
                          className="block cursor-pointer"
                        >
                          <Field
                            orientation="horizontal"
                            className="items-center rounded-xl p-4 transition hover:bg-muted/40 relative"
                          >

                            <FieldContent>
                              <FieldTitle>
                                <div className="flex items-center gap-2">
                                  <div className="flex gap-2 items-center">
                                    <span>
                                      {account.accountNumber} ({account.bankName})
                                    </span>
                                    {account.isDefault && (
                                      <span className="text-xs font-medium text-muted-foreground">
                                        Mặc định
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </FieldTitle>

                              <FieldDescription>
                                {account.bankAccountName}
                              </FieldDescription>
                            </FieldContent>

                            <RadioGroupItem
                              value={account.id}
                              id={account.id}
                              className="hidden"
                            />
                          </Field>
                        </FieldLabel>
                      ))}
                    </RadioGroup>
                  </div>
                </>
              )}
            </div>

            <div className="flex gap-2 justify-between">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Hủy
              </Button>
              <Button
                onClick={() => setCurrentStep(2)}
                disabled={!selectedAccountId || sortedBankAccounts.length === 0}
              >
                Tiếp theo
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Display QR Code */}
        {currentStep === 2 && (
          <div className="flex flex-col gap-6">
            <div className="flex w-full flex-col gap-6">
              {/* QR Code Section */}
              <div className="flex justify-center flex-col items-center gap-4 rounded-2xl border bg-white p-6">
                <div ref={qrRef}>
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
              </div>

              {/* Account and Payment Info */}
              <div className="space-y-3 rounded-xl border p-4 bg-muted/30">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Ngân hàng</p>
                    <p className="font-semibold">{selectedAccount?.bankName ?? "-"}</p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">Chủ tài khoản</p>
                    <p className="font-semibold">
                      {selectedAccount?.bankAccountName ?? "-"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">Số tài khoản</p>
                    <p className="font-semibold">
                      {selectedAccount?.accountNumber ?? "-"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">Số tiền</p>
                    <p className="font-semibold text-destructive">
                      {formatCurrency(amount)}
                    </p>
                  </div>
                </div>

                <div className="border-t pt-3">
                  <p className="text-sm text-muted-foreground">Mã hóa đơn</p>
                  <p className="font-semibold">{invoiceCode}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-2 justify-between">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(1)}
              >
                Quay lại
              </Button>
              <Button
                onClick={() => onOpenChange(false)}
              >
                Hoàn tất
              </Button>
            </div>
          </div>
        )}

      </DialogContent>
    </Dialog>
  );
}