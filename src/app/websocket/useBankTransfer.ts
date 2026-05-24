import { useAuthStore } from "@/features/auth/store/auth-store";
import { BankTransferNotification } from "@/features/transactions/types/bank.types";
import { getProfile } from "@/services/auth-api";
import { useEffect, useRef, useState, useCallback } from "react";

type RawListener = (raw: string) => void;

interface Props {
  onBankTransfer?: (data: BankTransferNotification) => void;
}

export function useBankTransfer({ onBankTransfer }: Props) {
  const wsRef = useRef<WebSocket | null>(null);
  const rawListeners = useRef<RawListener[]>([]);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const isUnmountedRef = useRef(false);
  const userIdRef = useRef<number | null>(null);
  const onBankTransferRef = useRef(onBankTransfer);

  const [ready, setReady] = useState(false);

  useEffect(() => {
    onBankTransferRef.current = onBankTransfer;
  }, [onBankTransfer]);

  const sendRaw = useCallback((data: unknown) => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    ws.send(JSON.stringify(data));
  }, []);

  const subscribeRaw = useCallback((fn: RawListener) => {
    rawListeners.current.push(fn);
    return () => {
      rawListeners.current = rawListeners.current.filter((l) => l !== fn);
    };
  }, []);

  const clearReconnectTimeout = useCallback(() => {
    if (reconnectTimeoutRef.current !== null) {
      window.clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, []);

  const connect = useCallback(() => {
    const userId = userIdRef.current;
    if (!userId || isUnmountedRef.current) return;

    const current = wsRef.current;
    if (
      current &&
      (current.readyState === WebSocket.OPEN ||
        current.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }

    const ws = new WebSocket(`ws://localhost:18080/ws?userId=${userId}`);
    wsRef.current = ws;

    ws.onopen = () => {
      setReady(true);
      reconnectAttemptsRef.current = 0;
      clearReconnectTimeout();
    };

    ws.onmessage = (evt) => {
      const raw = String(evt.data);

      rawListeners.current.forEach((fn) => fn(raw));

      try {
        const parsed = JSON.parse(raw);

        onBankTransferRef.current?.(parsed.data);
      } catch {}
    };

    ws.onerror = () => {
      setReady(false);
      ws.close();
    };

    ws.onclose = () => {
      setReady(false);
      wsRef.current = null;

      if (!isUnmountedRef.current) {
        reconnectAttemptsRef.current += 1;
        const delay = Math.min(
          1000 * 2 ** (reconnectAttemptsRef.current - 1),
          10000
        );

        reconnectTimeoutRef.current = window.setTimeout(() => {
          connect();
        }, delay);
      }
    };
  }, [clearReconnectTimeout]);

  useEffect(() => {
    isUnmountedRef.current = false;


    const init = async () => {
      try {
        const user = await getProfile();
        if (!user?.id || isUnmountedRef.current) return;

        userIdRef.current = user.id;
        connect();
      } catch {
        reconnectAttemptsRef.current += 1;
        const delay = Math.min(
          1000 * 2 ** (reconnectAttemptsRef.current - 1),
          10000
        );

        reconnectTimeoutRef.current = window.setTimeout(() => {
          if (!isUnmountedRef.current) {
            init();
          }
        }, delay);
      }
    };

    init();

    return () => {
      isUnmountedRef.current = true;
      clearReconnectTimeout();
      wsRef.current?.close();
      wsRef.current = null;
      setReady(false);
    };
  }, [clearReconnectTimeout, connect]);

  return {
    ready,
    sendRaw,
    subscribeRaw,
  };
}