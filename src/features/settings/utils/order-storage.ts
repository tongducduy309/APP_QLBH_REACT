export const ORDER_STORAGE_KEYS = {
  createDraft: "sales-multi-order-draft-v2",
  editDraftPrefix: "sales-edit-order-",
} as const;

export type OrderStorageKind =
  | "create-draft"
  | "edit-draft"
  | "unknown-order";

export type OrderStorageItem = {
  key: string;
  kind: OrderStorageKind;
  bytes: number;
  sizeLabel: string;
  orderId: string | null;
  updatedAt?: string | null;
  expiresAt?: string | null;
  raw: string;
};

export type OrderStorageSummary = {
  items: OrderStorageItem[];
  totalBytes: number;
  totalSizeLabel: string;
  totalKeys: number;
};

const textEncoder = new TextEncoder();

export function getUtf8Bytes(text: string) {
  return textEncoder.encode(text).length;
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function getOrderStorageKind(key: string): OrderStorageKind | null {
  if (key === ORDER_STORAGE_KEYS.createDraft) return "create-draft";
  if (key.startsWith(ORDER_STORAGE_KEYS.editDraftPrefix)) return "edit-draft";
  return null;
}

export function extractEditOrderId(key: string) {
  if (!key.startsWith(ORDER_STORAGE_KEYS.editDraftPrefix)) return null;
  return key.slice(ORDER_STORAGE_KEYS.editDraftPrefix.length) || null;
}

export function listOrderStorageItems(): OrderStorageItem[] {
  if (typeof window === "undefined") return [];

  const items: OrderStorageItem[] = [];

  for (let i = 0; i < window.localStorage.length; i += 1) {
    const key = window.localStorage.key(i);
    if (!key) continue;

    const kind = getOrderStorageKind(key);
    if (!kind) continue;

    const raw = window.localStorage.getItem(key) ?? "";
    const bytes = getUtf8Bytes(raw);

    let updatedAt: string | null = null;
    let expiresAt: string | null = null;

    try {
      const parsed = JSON.parse(raw) as {
        updatedAt?: string;
        expiresAt?: string;
      };

      updatedAt = parsed.updatedAt ?? null;
      expiresAt = parsed.expiresAt ?? null;
    } catch {
      // bỏ qua nếu không parse được
    }

    items.push({
      key,
      kind,
      bytes,
      sizeLabel: formatBytes(bytes),
      orderId: kind === "edit-draft" ? extractEditOrderId(key) : null,
      updatedAt,
      expiresAt,
      raw,
    });
  }

  return items.sort((a, b) => b.bytes - a.bytes);
}

export function getOrderStorageSummary(): OrderStorageSummary {
  const items = listOrderStorageItems();
  const totalBytes = items.reduce((sum, item) => sum + item.bytes, 0);

  return {
    items,
    totalBytes,
    totalSizeLabel: formatBytes(totalBytes),
    totalKeys: items.length,
  };
}

export function clearAllOrderStorage() {
  if (typeof window === "undefined") return;

  const keysToRemove: string[] = [];

  for (let i = 0; i < window.localStorage.length; i += 1) {
    const key = window.localStorage.key(i);
    if (!key) continue;

    if (
      key === ORDER_STORAGE_KEYS.createDraft ||
      key.startsWith(ORDER_STORAGE_KEYS.editDraftPrefix)
    ) {
      keysToRemove.push(key);
    }
  }

  keysToRemove.forEach((key) => {
    window.localStorage.removeItem(key);
  });

  return keysToRemove.length;
}

export function clearCreateDraftStorage() {
  if (typeof window === "undefined") return 0;

  if (window.localStorage.getItem(ORDER_STORAGE_KEYS.createDraft) == null) {
    return 0;
  }

  window.localStorage.removeItem(ORDER_STORAGE_KEYS.createDraft);
  return 1;
}

export function clearEditDraftStorage() {
  if (typeof window === "undefined") return 0;

  const keysToRemove: string[] = [];

  for (let i = 0; i < window.localStorage.length; i += 1) {
    const key = window.localStorage.key(i);
    if (!key) continue;

    if (key.startsWith(ORDER_STORAGE_KEYS.editDraftPrefix)) {
      keysToRemove.push(key);
    }
  }

  keysToRemove.forEach((key) => {
    window.localStorage.removeItem(key);
  });

  return keysToRemove.length;
}