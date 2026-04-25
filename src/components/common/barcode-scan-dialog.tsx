import { useEffect, useRef, useState } from "react";
import { Camera, CheckCircle2, ScanBarcode } from "lucide-react";
import { BrowserMultiFormatReader, type IScannerControls } from "@zxing/browser";
import { BarcodeFormat, DecodeHintType } from "@zxing/library";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type BarcodeScanDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onScan: (barcode: string) => void;
};

type ScanStatus = "idle" | "scanning" | "success" | "error";

export function BarcodeScanDialog({
  open,
  onOpenChange,
  onScan,
}: BarcodeScanDialogProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const controlsRef = useRef<IScannerControls | null>(null);

  const [barcode, setBarcode] = useState("");
  const [detectedCode, setDetectedCode] = useState("");
  const [error, setError] = useState("");
  const [scanStatus, setScanStatus] = useState<ScanStatus>("idle");

  const stopScanner = () => {
    controlsRef.current?.stop();
    controlsRef.current = null;

    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const handleSuccess = (value: string) => {
    const result = value.trim();
    if (!result) return;

    stopScanner();

    setDetectedCode(result);
    setScanStatus("success");

    window.setTimeout(() => {
      onScan(result);
      setBarcode("");
      setDetectedCode("");
      onOpenChange(false);
    }, 700);
  };

  useEffect(() => {
    if (!open) {
      stopScanner();
      setBarcode("");
      setDetectedCode("");
      setError("");
      setScanStatus("idle");
      return;
    }

    let cancelled = false;

    async function startScanner() {
      try {
        setError("");
        setDetectedCode("");
        setScanStatus("scanning");

        await new Promise((resolve) => window.setTimeout(resolve, 300));

        if (cancelled || !videoRef.current) return;

        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error("Trình duyệt không hỗ trợ camera.");
        }

        const hints = new Map();

hints.set(DecodeHintType.POSSIBLE_FORMATS, [
  BarcodeFormat.CODE_128,
  BarcodeFormat.CODE_39,
]);

hints.set(DecodeHintType.TRY_HARDER, true);

        const reader = new BrowserMultiFormatReader(hints);

        const constraints: MediaStreamConstraints = {
  video: {
    facingMode: { ideal: "environment" },
    width: { ideal: 1920 },
    height: { ideal: 1080 },
  },
  audio: false,
};

        controlsRef.current = await reader.decodeFromConstraints(
          constraints,
          videoRef.current,
          (result) => {
            if (cancelled) return;

            if (result) {
              handleSuccess(result.getText());
            }
          }
        );
      } catch (err) {
        console.error(err);
        setScanStatus("error");
        setError(
          "Không thể mở camera. Vui lòng cấp quyền camera hoặc chạy bằng localhost/https."
        );
      }
    }

    startScanner();

    return () => {
      cancelled = true;
      stopScanner();
    };
  }, [open]);

  const handleSubmitManual = () => {
    if (!barcode.trim()) return;
    handleSuccess(barcode);
  };

  const closeDialog = () => {
    stopScanner();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={closeDialog}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ScanBarcode className="h-5 w-5" />
            Quét mã vạch
          </DialogTitle>

          <DialogDescription>
            Đưa mã vạch vào giữa khung camera, giữ ngang và đủ sáng.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative overflow-hidden rounded-xl border bg-black">
            <video
              ref={videoRef}
              className="h-72 w-full bg-black object-cover"
              muted
              autoPlay
              playsInline
            />

            <div className="pointer-events-none absolute inset-0">
              <div className="absolute inset-0 bg-black/20" />

              <div
  className={`absolute left-1/2 top-1/2 h-40 w-[92%] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border-2 shadow-[0_0_0_9999px_rgba(0,0,0,0.25)] ${
    scanStatus === "success"
      ? "border-green-400"
      : scanStatus === "error"
      ? "border-red-400"
      : "border-white"
  }`}
>
                <div className="absolute left-4 right-4 top-1/2 h-0.5 -translate-y-1/2 bg-white shadow-[0_0_12px_rgba(255,255,255,0.9)]" />

                <span className="absolute left-0 top-0 h-6 w-6 rounded-tl-xl border-l-4 border-t-4 border-white" />
                <span className="absolute right-0 top-0 h-6 w-6 rounded-tr-xl border-r-4 border-t-4 border-white" />
                <span className="absolute bottom-0 left-0 h-6 w-6 rounded-bl-xl border-b-4 border-l-4 border-white" />
                <span className="absolute bottom-0 right-0 h-6 w-6 rounded-br-xl border-b-4 border-r-4 border-white" />
              </div>
            </div>

            <div
              className={`absolute left-3 top-3 flex items-center gap-2 rounded-full px-3 py-1 text-xs text-white ${
                scanStatus === "success"
                  ? "bg-green-600"
                  : scanStatus === "error"
                  ? "bg-red-600"
                  : "bg-black/70"
              }`}
            >
              {scanStatus === "success" ? (
                <CheckCircle2 className="h-3.5 w-3.5" />
              ) : (
                <Camera className="h-3.5 w-3.5" />
              )}

              {scanStatus === "success"
                ? "Đã nhận diện"
                : scanStatus === "error"
                ? "Lỗi camera"
                : "Đang quét camera..."}
            </div>

            <div className="absolute bottom-3 left-1/2 w-[90%] -translate-x-1/2 rounded-lg bg-black/70 px-3 py-2 text-center text-xs text-white">
              Đưa mã vạch thật vào giữa khung trắng
            </div>
          </div>

          {scanStatus === "scanning" && (
            <p className="rounded-md bg-slate-50 px-3 py-2 text-sm text-slate-600">
              Đang tìm mã vạch... Hãy để mã rõ nét, đủ sáng và nằm ngang trong
              khung.
            </p>
          )}

          {scanStatus === "success" && (
            <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
              Đã quét thành công:{" "}
              <span className="font-semibold tracking-widest">
                {detectedCode}
              </span>
            </p>
          )}

          {error && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </p>
          )}

          <Input
            value={barcode}
            onChange={(event) => setBarcode(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                handleSubmitManual();
              }
            }}
            placeholder="Hoặc nhập mã vạch thủ công..."
            className="h-11 text-center text-base font-medium tracking-widest"
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={closeDialog}>
            Hủy
          </Button>

          <Button onClick={handleSubmitManual} disabled={!barcode.trim()}>
            Tìm kiếm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}