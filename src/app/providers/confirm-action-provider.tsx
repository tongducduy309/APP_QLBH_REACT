import { createContext, useContext, useState, type ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

type ConfirmActionOptions = {
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive";

  requireCheckbox?: boolean;
  checkboxText?: string;
};

type ConfirmActionContextValue = {
  confirm: (options?: ConfirmActionOptions) => Promise<boolean>;
};

const ConfirmActionContext = createContext<ConfirmActionContextValue | null>(
  null
);

export function ConfirmActionProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [checked, setChecked] = useState(false);
  const [options, setOptions] = useState<ConfirmActionOptions>({});
  const [resolver, setResolver] =
    useState<((value: boolean) => void) | null>(null);

  const confirm = (opts?: ConfirmActionOptions) => {
    setOptions(opts || {});
    setChecked(false);
    setOpen(true);

    return new Promise<boolean>((resolve) => {
      setResolver(() => resolve);
    });
  };

  const closeDialog = () => {
    setOpen(false);
    setChecked(false);
    setResolver(null);
  };

  const handleCancel = () => {
    resolver?.(false);
    closeDialog();
  };

  const handleConfirm = () => {
    resolver?.(true);
    closeDialog();
  };

  const confirmDisabled = options.requireCheckbox && !checked;

  return (
    <ConfirmActionContext.Provider value={{ confirm }}>
      {children}

      <Dialog
        open={open}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) handleCancel();
        }}
      >
        <DialogContent
          className="rounded-2xl sm:max-w-md"
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          <DialogHeader className="flex w-full flex-col items-center justify-center text-center">
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-black/10 text-black">
              <AlertTriangle className="h-5 w-5" />
            </div>

            <DialogTitle>{options.title || "Xác nhận thao tác"}</DialogTitle>

            <DialogDescription>
              {options.description ||
                "Bạn có chắc chắn muốn thực hiện thao tác này không?"}
            </DialogDescription>
          </DialogHeader>

          {options.requireCheckbox && (
            <div className="flex items-start gap-3 rounded-md border p-3">
              <Checkbox
                id="confirm-action-checkbox"
                checked={checked}
                onCheckedChange={(value) => setChecked(value === true)}
              />

              <label
                htmlFor="confirm-action-checkbox"
                className="cursor-pointer text-sm leading-5"
              >
                {options.checkboxText || "Tôi xác nhận muốn thực hiện thao tác này"}
              </label>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={handleCancel}>
              {options.cancelText || "Hủy"}
            </Button>

            <Button
              variant={options.variant || "default"}
              disabled={confirmDisabled}
              onClick={handleConfirm}
            >
              {options.confirmText || "Xác nhận"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </ConfirmActionContext.Provider>
  );
}

export function useConfirmAction() {
  const context = useContext(ConfirmActionContext);

  if (!context) {
    throw new Error("useConfirmAction must be used inside ConfirmActionProvider");
  }

  return context;
}