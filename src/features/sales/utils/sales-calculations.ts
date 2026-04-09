// src/modules/sales/utils/sales-calculations.ts

export const toNumber = (value: unknown) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
};

export const calculateLineTotal = ({
  quantity,
  length,
  price,
}: {
  quantity: number;
  length: number;
  price: number;
}) => {
  const q = toNumber(quantity);
  const l = toNumber(length);
  const p = toNumber(price);

  if (l > 0) return q * l * p;
  return q * p;
};

export const calculateTaxAmount = (
  subTotalBeforeTax: number,
  taxPercent: number
) => {
  if (taxPercent <= 0) return 0;
  return (subTotalBeforeTax * taxPercent) / 100;
};

export const calculateRemainingAmount = (
  grandTotal: number,
  paidAmount: number
) => Math.max(grandTotal - paidAmount, 0);

export const calculateChangeAmount = (
  grandTotal: number,
  paidAmount: number
) => Math.max(paidAmount - grandTotal, 0);

export function getEffectiveQuantity(input: {
  quantity?: number | null;
  length?: number | null;
}) {
  const quantity = Number(input.quantity ?? 0);
  const length = Number(input.length ?? 0);

  return length > 0 ? quantity * length : quantity;
}