export interface BankAccount {
  id: string;
  bankCode: string;
  accountNumber: string;
  bankName: string;
  active: boolean;
  isDefault: boolean;
  bankAccountName: string;
}

export interface BankAccountCreateReq {
  bankCode: string;
  accountNumber: string;
  bankName: string;
  bankAccountName: string;
}

export interface BankTransferNotification {
    id:number;
    accountNumber: string;
    bankName: string;
    bankAccountName: string;
    transferAmount: number;
    description: string;
}