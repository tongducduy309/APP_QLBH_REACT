import { useMemo, useState } from "react";
import { Search, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export type CustomerItem = {
  id: number;
  name: string;
  phone: string;
  address: string;
  groupKey?: string;
};

type CustomerPickerDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customers: CustomerItem[];
  loading?: boolean;
  onChoose: (customer: CustomerItem) => void;
  onSaveNew?: (customer: Omit<CustomerItem, "id">) => Promise<void> | void;
};

type DraftCustomer = {
  name: string;
  phone: string;
  address: string;
};

const normalize = (value: string) => value.trim().toLowerCase();

export function CustomerPickerDialog({
  open,
  onOpenChange,
  customers,
  loading = false,
  onChoose,
  onSaveNew,
}: CustomerPickerDialogProps) {
  const [keyword, setKeyword] = useState("");
  const [draft, setDraft] = useState<DraftCustomer>({
    name: "",
    phone: "",
    address: "",
  });

  const filteredCustomers = useMemo(() => {
    const q = normalize(keyword);
    if (!q) return customers;

    return customers.filter((item) => {
      return (
        normalize(item.name).includes(q) ||
        normalize(item.phone).includes(q) ||
        normalize(item.address).includes(q)
      );
    });
  }, [customers, keyword]);

  const matchedExisting = useMemo(() => {
    const phone = normalize(draft.phone);
    if (!phone) return false;
    return customers.some((item) => normalize(item.phone) === phone);
  }, [customers, draft.phone]);

  const canSaveNew =
    draft.name.trim().length > 0 &&
    draft.phone.trim().length > 0 &&
    !matchedExisting;

  const groupedCustomers = useMemo(() => {
    const groups = new Map<string, CustomerItem[]>();

    for (const customer of filteredCustomers) {
      const key =
        customer.groupKey ||
        (customer.name?.trim()?.[0]?.toUpperCase() || "#");

      if (!groups.has(key)) {
        groups.set(key, []);
      }

      groups.get(key)!.push(customer);
    }

    return Array.from(groups.entries()).sort((a, b) =>
      a[0].localeCompare(b[0], "vi")
    );
  }, [filteredCustomers]);

  const handleSaveNew = async () => {
    if (!canSaveNew || !onSaveNew) return;

    await onSaveNew({
      name: draft.name.trim(),
      phone: draft.phone.trim(),
      address: draft.address.trim(),
    });

    setDraft({
      name: "",
      phone: "",
      address: "",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-hidden sm:max-w-4xl">
        <DialogHeader className="border-b px-6 py-4">
          <DialogTitle>Danh bạ khách hàng</DialogTitle>
        </DialogHeader>

        <div className="max-h-[calc(90vh-70px)]">
          <div className="relative mb-4">
              <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Nhập tên hoặc số điện thoại..."
                className="pl-9"
              />
            </div>

            <div className="max-h-[62vh] overflow-y-auto rounded-xl border">
              {loading ? (
                <div className="p-6 text-center text-sm text-muted-foreground">
                  Đang tải dữ liệu...
                </div>
              ) : filteredCustomers.length === 0 ? (
                <div className="p-6 text-center text-sm text-muted-foreground">
                  Không có khách hàng phù hợp
                </div>
              ) : (
                <div className="divide-y">
                  {groupedCustomers.map(([groupKey, items]) => (
                    <div key={groupKey}>
                      <div className="bg-muted/40 px-4 py-2 text-sm font-medium">
                        {groupKey}
                      </div>

                      {items.map((customer, index) => (
                        <button
                          key={customer.id}
                          type="button"
                          onClick={() => {
                            onChoose(customer);
                            onOpenChange(false);
                          }}
                          className="grid w-full grid-cols-[60px,1fr,160px,1fr] gap-3 px-4 py-3 text-left transition hover:bg-muted/50"
                        >
                          <div className="text-sm text-muted-foreground">
                            {index + 1}
                          </div>
                          <div className="font-medium">{customer.name}</div>
                          <div className="text-sm">{customer.phone}</div>
                          <div className="text-sm text-muted-foreground">
                            {customer.address || "-"}
                          </div>
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>

        </div>
      </DialogContent>
    </Dialog>
  );
}