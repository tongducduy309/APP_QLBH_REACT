import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";
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
import { confirmPassword as confirmPasswordService } from "@/services/auth-api";

type ConfirmPasswordOptions = {
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
};

type ConfirmPasswordContextValue = {
  confirmPassword: (options?: ConfirmPasswordOptions) => Promise<string | null>;
};

const ConfirmPasswordContext =
  createContext<ConfirmPasswordContextValue | null>(null);

export function ConfirmPasswordProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [options, setOptions] = useState<ConfirmPasswordOptions>({});
  const [resolver, setResolver] =
    useState<((value: string | null) => void) | null>(null);

  const confirmPassword = (opts?: ConfirmPasswordOptions) => {
    setOptions(opts || {});
    setPassword("");
    setShowPassword(false);
    setOpen(true);

    return new Promise<string | null>((resolve) => {
      setResolver(() => resolve);
    });
  };

  const handleCancel = () => {
    resolver?.(null);
    setOpen(false);
    setPassword("");
  };

  const handleConfirm = async () => {
    if (!password.trim()) return;

    await confirmPasswordService(password).then(() => {
      resolver?.(password);
      setOpen(false);
      setPassword("");
    }).catch((error) => {
        console.error(error.message);
        
    });

  };

  return (
    <ConfirmPasswordContext.Provider value={{ confirmPassword }}>
      {children}

      <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && handleCancel()}>
        <DialogContent
          className="
            fixed right-4 top-4
    left-auto translate-x-0 translate-y-0
    sm:right-6 sm:top-6
    max-w-[calc(100vw-2rem)] sm:max-w-md
    rounded-2xl
          "
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          <DialogHeader className="flex flex-col items-center justify-center w-full">
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-orange-600">
              <Lock className="h-5 w-5" />
            </div>

            <DialogTitle className="text-center">
              Xác nhận mật khẩu
            </DialogTitle>

            <DialogDescription className="text-center">
              Vui lòng nhập mật khẩu của bạn để tiếp tục thao tác này.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">

            <div className="relative">
              <Input
                id="confirm-password"
                autoFocus
                value={password}
                type={showPassword ? "text" : "password"}
                placeholder="Nhập mật khẩu..."
                className="pr-10"
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleConfirm();
                }}
              />

              <button
                type="button"
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
            <Button variant="outline" onClick={handleCancel}>
              {options.cancelText || "Hủy"}
            </Button>

            <Button disabled={!password.trim()} onClick={handleConfirm}>
              {options.confirmText || "Xác nhận"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </ConfirmPasswordContext.Provider>
  );
}

export function useConfirmPassword() {
  const context = useContext(ConfirmPasswordContext);

  if (!context) {
    throw new Error(
      "useConfirmPassword must be used inside ConfirmPasswordProvider"
    );
  }

  return context;
}