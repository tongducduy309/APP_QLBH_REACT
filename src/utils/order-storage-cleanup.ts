const ORDER_CREATE_KEY = "sales-multi-order-draft-v2";
const ORDER_EDIT_PREFIX = "sales-edit-order-";

type PersistedStateLike = {
  expiresAt?: string | null;
};

const isOrderStorageKey = (key: string) => {
  return (
    key === ORDER_CREATE_KEY ||
    key.startsWith(ORDER_EDIT_PREFIX)
  );
};

const isExpired = (expiresAt?: string | null) => {
  if (!expiresAt) return true;

  const time = new Date(expiresAt).getTime();
  return Number.isNaN(time) || time <= Date.now();
};

export type CleanupOrderStorageResult = {
  removedKeys: string[];
  scannedKeys: string[];
};

export const cleanupExpiredOrderStorage = (): CleanupOrderStorageResult => {
  if (typeof window === "undefined") {
    return {
      removedKeys: [],
      scannedKeys: [],
    };
  }

  const removedKeys: string[] = [];
  const scannedKeys: string[] = [];

  for (let i = 0; i < window.localStorage.length; i += 1) {
    const key = window.localStorage.key(i);
    if (!key) continue;
    if (!isOrderStorageKey(key)) continue;

    scannedKeys.push(key);

    try {
      const raw = window.localStorage.getItem(key);
      if (!raw) {
        window.localStorage.removeItem(key);
        removedKeys.push(key);
        continue;
      }

      const parsed = JSON.parse(raw) as PersistedStateLike;

      if (isExpired(parsed.expiresAt ?? null)) {
        window.localStorage.removeItem(key);
        removedKeys.push(key);
      }
    } catch (error) {
      console.error("Không thể đọc draft order trong localStorage:", key, error);
      window.localStorage.removeItem(key);
      removedKeys.push(key);
    }
  }

  return {
    removedKeys,
    scannedKeys,
  };
};