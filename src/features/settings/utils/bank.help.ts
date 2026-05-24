export function formatTransferCode(transactionContent: string | null | undefined): string {
  const content = (transactionContent ?? "").trim();
  if (!content) {
    return "";
  }

  const extractors: RegExp[] = [
    /mã\s*(?:đơn\s*hàng|đơn|tham chiếu)\s*[:\-]?\s*([A-Z0-9\-]+)/i,
    /(?:đơn\s*hàng|order)\s*[:\-]?\s*([A-Z0-9\-]+)/i,
    /(?:ref(?:erence)?|tham\s*chiếu)\s*[:\-]?\s*([A-Z0-9\-]+)/i,
    /\b([A-Z]{2,}[0-9]{3,})\b/,
    /\b(\d{6,})\b/,
  ];

  for (const extractor of extractors) {
    const match = content.match(extractor);
    if (match?.[1]) {
      const code = match[1].trim().replace(/[^A-Z0-9\-]/gi, "");
      if (code) {
        return code;
      }
    }
  }

  return content;
}
