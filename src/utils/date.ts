import dayjs from "dayjs";

/**
 * Format ISO string → dd/MM/yyyy
 */
export function formatDateToDDMMYYYY(date?: string | null): string {
  if (!date) return "";

  const d = dayjs(date);
  if (!d.isValid()) return "";

  return d.format("DD/MM/YYYY");
}

/**
 * Format ISO string → dd/MM/yyyy HH:mm
 */
export function formatDateTime(date?: string | null): string {
  if (!date) return "";

  const d = dayjs(date);
  if (!d.isValid()) return "";

  return d.format("DD/MM/YYYY HH:mm");
}

/**
 * Convert dd/MM/yyyy → YYYY-MM-DD (chuẩn backend)
 */
export function parseDDMMYYYYToISO(date?: string | null): string {
  if (!date) return "";

  const d = dayjs(date, "DD/MM/YYYY");
  if (!d.isValid()) return "";

  return d.format("YYYY-MM-DD");
}

/**
 * Convert DatePicker (dayjs) → ISO string
 */
export function toISODateString(date: dayjs.Dayjs | null): string {
  if (!date) return "";
  return date.format("YYYY-MM-DD");
}

/**
 * Convert ISO → dayjs (dùng cho DatePicker)
 */
export function toDayjs(date?: string | null) {
  if (!date) return null;

  const d = dayjs(date);
  return d.isValid() ? d : null;
}

/**
 * Lấy ngày hôm nay dạng YYYY-MM-DD
 */
export function getTodayISO(): string {
  return dayjs().format("YYYY-MM-DD");
}

/**
 * So sánh 2 ngày (YYYY-MM-DD)
 */
export function isSameDate(a?: string, b?: string): boolean {
  if (!a || !b) return false;
  return dayjs(a).isSame(dayjs(b), "day");
}