import { useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ConfirmPasswordDialogProps = {
  open: boolean;
  loading?: boolean;
  title?: string;
  description?: string;
  onClose: () => void;
  onConfirm: (password: string) => void | Promise<void>;
};

export function ConfirmPasswordDialog({
  open,
  loading = false,
  title = "Xác nhận mật khẩu",
  description = "Vui lòng nhập mật khẩu của bạn để tiếp tục thao tác này.",
  onClose,
  onConfirm,
}: ConfirmPasswordDialogProps) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleClose = () => {
    if (loading) return;
    setPassword("");
    setShowPassword(false);
    onClose();
  };

  const handleSubmit = async () => {
    if (!password.trim() || loading) return;

    await onConfirm(password);
  };

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && handleClose()}>
      <DialogContent
        className="
          fixed left-4 top-4 translate-x-0 translate-y-0
          sm:left-6 sm:top-6
          max-w-[calc(100vw-2rem)] sm:max-w-md
          rounded-2xl
        "
      >
        <DialogHeader>
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-orange-600">
            <Lock className="h-5 w-5" />
          </div>

          <DialogTitle>{title}</DialogTitle>

          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="confirm-password">Mật khẩu</Label>

          <div className="relative">
            <Input
              id="confirm-password"
              type={showPassword ? "text" : "password"}
              value={password}
              disabled={loading}
              autoFocus
              placeholder="Nhập mật khẩu..."
              className="pr-10"
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSubmit();
                }
              }}
            />

            <button
              type="button"
              disabled={loading}
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" disabled={loading} onClick={handleClose}>
            Hủy
          </Button>

          <Button
            disabled={!password.trim() || loading}
            onClick={handleSubmit}
          >
            {loading ? "Đang xác nhận..." : "Xác nhận"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}