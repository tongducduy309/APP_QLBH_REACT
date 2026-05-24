import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";

import { ChevronsUpDown, Check } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export interface BankAccount {
    id: string;
    bankCode: string;
    accountNumber: string;
    bankName: string;
    active: boolean;
    isDefault: boolean;
    bankAccountName: string;
}

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onAddBankAccount: (bankAccount: BankAccount) => void;
};

const BANKS = [
    { code: "VCB", name: "Vietcombank" },
    { code: "TCB", name: "Techcombank" },
    { code: "ACB", name: "ACB" },
    { code: "MB", name: "MB Bank" },
    { code: "BIDV", name: "BIDV" },
    { code: "VPB", name: "VPBank" },
];

export function AddBankAccountDialog({
    open,
    onOpenChange,
    onAddBankAccount,
}: Props) {
    const [bankCode, setBankCode] = useState("");
    const [accountNumber, setAccountNumber] = useState("");
    const [bankAccountName, setBankAccountName] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [bankOpen, setBankOpen] = useState(false);
    const [bankSearch, setBankSearch] = useState("");

    if (!open) return null;

    const selectedBank = BANKS.find((bank) => bank.code === bankCode);

    const bankError = submitted && !bankCode;
    const accountNumberError = submitted && !accountNumber.trim();
    const bankAccountNameError = submitted && !bankAccountName.trim();

    const handleClose = () => {
        setBankCode("");
        setAccountNumber("");
        setBankAccountName("");
        setSubmitted(false);
        onOpenChange(false);
    };

    const handleSubmit = () => {
        setSubmitted(true);

        if (!selectedBank || !accountNumber.trim() || !bankAccountName.trim()) {
            return;
        }

        const newBankAccount: BankAccount = {
            id: crypto.randomUUID(),
            bankCode: selectedBank.code,
            bankName: selectedBank.name,
            accountNumber: accountNumber.trim(),
            bankAccountName: bankAccountName.trim(),
            active: true,
            isDefault: false,
        };

        onAddBankAccount(newBankAccount);
        handleClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-lg rounded-2xl bg-background shadow-xl">
                <div className="border-b px-6 py-4">
                    <h3 className="text-lg font-semibold">
                        Thêm tài khoản ngân hàng
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        Các thông tin bên dưới đều bắt buộc nhập.
                    </p>
                </div>

                <div className="space-y-4 p-6">
                    <div className="space-y-2">
                        <Label>Ngân hàng *</Label>

                        <Popover open={bankOpen} onOpenChange={setBankOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    type="button"
                                    variant="outline"
                                    role="combobox"
                                    className="w-full justify-between"
                                >
                                    {selectedBank
                                        ? `${selectedBank.name} - ${selectedBank.code}`
                                        : "Chọn hoặc nhập tên ngân hàng"}

                                    <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                                </Button>
                            </PopoverTrigger>

                            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                                <Command>
                                    <CommandInput
                                        placeholder="Nhập tên ngân hàng..."
                                        value={bankSearch}
                                        onValueChange={setBankSearch}
                                    />

                                    <CommandList>
                                        <CommandEmpty>Không tìm thấy ngân hàng.</CommandEmpty>

                                        <CommandGroup>
                                            {BANKS.map((bank) => (
                                                <CommandItem
                                                    key={bank.code}
                                                    value={`${bank.name} ${bank.code}`}
                                                    onSelect={() => {
                                                        setBankCode(bank.code);
                                                        setBankSearch(bank.name);
                                                        setBankOpen(false);
                                                    }}
                                                >
                                                    {bank.name} - {bank.code}
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>

                        {bankError && (
                            <p className="text-sm text-red-500">Vui lòng chọn ngân hàng.</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label>Số tài khoản *</Label>

                        <Input
                            value={accountNumber}
                            onChange={(e) => setAccountNumber(e.target.value)}
                            placeholder="Nhập số tài khoản"
                        />

                        {accountNumberError && (
                            <p className="text-sm text-red-500">
                                Vui lòng nhập số tài khoản.
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label>Tên chủ tài khoản *</Label>

                        <Input
                            value={bankAccountName}
                            onChange={(e) => setBankAccountName(e.target.value)}
                            placeholder="Nhập tên chủ tài khoản"
                        />

                        {bankAccountNameError && (
                            <p className="text-sm text-red-500">
                                Vui lòng nhập tên chủ tài khoản.
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex justify-end gap-3 border-t px-6 py-4">
                    <Button variant="outline" onClick={handleClose}>
                        Hủy
                    </Button>

                    <Button onClick={handleSubmit}>Thêm</Button>
                </div>
            </div>
        </div>
    );
}