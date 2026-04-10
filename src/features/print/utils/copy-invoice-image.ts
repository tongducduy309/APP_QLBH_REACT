import { toBlob } from "html-to-image";

export async function copyElementAsImage(element: HTMLElement) {
  const blob = await toBlob(element, {
    pixelRatio: 2,
    cacheBust: true,
    backgroundColor: "#ffffff",
  });

  if (!blob) {
    throw new Error("Không tạo được ảnh từ hóa đơn");
  }

  if (window.qlbh?.writeImageClipboard) {
    const arrayBuffer = await blob.arrayBuffer();
    const bytes = Array.from(new Uint8Array(arrayBuffer));

    const res = await window.qlbh.writeImageClipboard({
      bytes,
      mimeType: blob.type || "image/png",
    });

    if (!res?.ok) {
      throw new Error(res?.error || "Copy ảnh thất bại");
    }

    return;
  }

  if (
    navigator.clipboard &&
    "write" in navigator.clipboard &&
    typeof ClipboardItem !== "undefined"
  ) {
    await navigator.clipboard.write([
      new ClipboardItem({
        [blob.type || "image/png"]: blob,
      }),
    ]);
    return;
  }

  throw new Error("Môi trường hiện tại không hỗ trợ copy ảnh vào clipboard");
}