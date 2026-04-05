export {};

declare global {
  interface Window {
    qlbh?: {
      printPdfSilent: (payload: {
        bytes: number[];
        fileName?: string;
        copies?: number;
        deviceName?: string;
      }) => Promise<{ ok: boolean; error?: string }>;
    };
  }
}