import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Input } from "antd";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { sendInvoiceEmail } from "@/services/order-api";
import { getInvoicePdfBlob } from "@/features/print/services/Invoice-pdf-print.service";
import type { OrderRes } from "@/types/order";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: OrderRes | null;
  customerEmail: string;
};

export function SendInvoiceEmailDialog({
  open,
  onOpenChange,
  order,
  customerEmail
}: Props) {
  const [sending, setSending] = useState(false);

  const [to, setTo] = useState(customerEmail);
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");


  useEffect(() => {
    if (!open || !order) return;

    if(customerEmail){
      setTo(customerEmail);
    }

    console.log("customerEmail", customerEmail);

    const code = order.code ?? `HD-${order.id}`;

    setSubject(`Hóa đơn ${code}`);
    setContent(
      `Kính gửi Quý khách,\n\nEm gửi anh/chị hóa đơn ${code} đính kèm theo email này.\n\nTrân trọng.`
    );
  }, [open, order]);


  

  const handleSend = async () => {
    if (!order) {
      toast.info("Không tìm thấy dữ liệu hóa đơn");
      return;
    }

    if (!to.trim()) {
      toast.info("Vui lòng nhập email người nhận");
      return;
    }

    try {
      setSending(true);

      const pdfBlob = await getInvoicePdfBlob(order);

      await sendInvoiceEmail({
        orderId: order.id,
        to: to.trim(),
        subject: subject.trim(),
        content: content.trim(),
        pdfBlob,
        fileName: `${order.code || `hoa-don-${order.id}`}.pdf`,
      });

      toast.success("Đã gửi hóa đơn qua email");
      onOpenChange(false);
    } catch (error) {
      console.error("Lỗi gửi hóa đơn email", error);
    //   toast.error("Gửi hóa đơn qua email thất bại");
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl" onOpenAutoFocus={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Gửi hóa đơn PDF qua email</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4">

          <div className="grid gap-2">
            <label className="text-sm font-medium">Email người nhận</label>
            <Input
              placeholder="vd: khachhang@gmail.com"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium">Tiêu đề</label>
            <Input
              placeholder="Nhập tiêu đề email"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium">Nội dung</label>
            <Input.TextArea
              rows={8}
              placeholder="Nhập nội dung email"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={sending}
            >
              Hủy
            </Button>
            <Button type="button" onClick={handleSend} disabled={sending}>
              {sending ? "Đang gửi..." : "Gửi email"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}