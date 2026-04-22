

export type Role =
  | "ADMIN"
  | "STORE_MANAGER"
  | "OFFICE_STAFF"
  | "OPERATOR_DELIVERY";

export interface UserItem {
    id: number;
    username: string;
    fullName?: string;
    email?: string;
    phone?: string;
    roles: Role[];
}