export function formatNumberInput(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === "") return "";

  const numericString = String(value).replace(/[^\d.-]/g, "");
  if (!numericString || numericString === "-" || numericString === ".") return "";

  const [integerPart, decimalPart] = numericString.split(".");

  const formattedInteger = Number(integerPart || 0).toLocaleString("en-US");

  return decimalPart !== undefined
    ? `${formattedInteger}.${decimalPart}`
    : formattedInteger;
}

export function parseFormattedNumber(value: string): number {
  if (!value) return 0;

  const normalized = value.replace(/[^\d.-]/g, "");
  const parsed = Number(normalized);

  return Number.isFinite(parsed) ? parsed : 0;
}