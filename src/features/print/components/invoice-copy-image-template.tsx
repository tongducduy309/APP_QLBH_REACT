import type { CSSProperties } from "react";
import type { OrderRes } from "@/types/order";
import { formatDateToDDMMYYYY } from "@/utils/date";

type Props = {
  order: OrderRes | null;
};

function formatMoney(n: number): string {
  return new Intl.NumberFormat("vi-VN").format(Number(n || 0));
}

function formatQuantity(n: number): string {
  const num = Number(n || 0);
  if (Number.isInteger(num)) return String(num);
  return num.toLocaleString("vi-VN", { maximumFractionDigits: 3 });
}


// const LOGO_URL = "/logo.png";

export function InvoiceCopyImageTemplate({ order }: Props) {
  if (!order) return;
  const details = (order.details ?? []).map((item: any, index: number) => {
    const qty = Number(item.quantity ?? 0);
    const length = Number(item.length ?? 0);
    const totalQuantity =
      Number(item.totalQuantity ?? 0) || (length > 0 ? qty * length : qty);

    const subtotal =
      length > 0
        ? Number(item.price ?? 0) * totalQuantity
        : Number(item.price ?? 0) * qty;

    return {
      stt: index + 1,
      name: item.name ?? "",
      baseUnit: item.baseUnit ?? "",
      length,
      quantity: qty,
      totalQuantity,
      price: Number(item.price ?? 0),
      subtotal,
    };
  });

  const customer = order.customer as any;

  return (
    <div
      id="invoice-copy-image"
      style={{
        width: 1100,
        background: "#ffffff",
        color: "#111827",
        padding: 32,
        fontFamily: "Arial, Helvetica, sans-serif",
        boxSizing: "border-box",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <WatermarkPattern />
      <CenterLogoWatermark />

      <div style={{ position: "relative", zIndex: 1 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 24,
            marginBottom: 20,
          }}
        >
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14 }}>CÔNG TY TNHH MTV DV TÔN THÉP</div>
            <div style={{ fontSize: 28, fontWeight: 700, marginTop: 4 }}>
              TÂM ĐỨC CƯỜNG
            </div>
            <div style={{ marginTop: 8, fontSize: 14 }}>
              Địa chỉ: 413 Nguyễn Văn Tạo, Hiệp Phước, Hồ Chí Minh
            </div>
            <div style={{ fontSize: 14 }}>Di động: 0918.279.361 - 0933.770.378</div>
            <div style={{ fontSize: 14 }}>Mã số thuế: 0305971408</div>
            <div style={{ fontSize: 14 }}>Ngân hàng SACOMBANK: 060128011741</div>
          </div>

          <div style={{ width: 360, textAlign: "right" }}>
            <div style={{ fontSize: 30, fontWeight: 700 }}>BIÊN NHẬN GIAO HÀNG</div>
            <div style={{ marginTop: 8, fontSize: 16 }}>
              <b>Số:</b> {order.code ?? ""}
            </div>
            <div style={{ fontSize: 16 }}>
              <b>Ngày tạo:</b> {formatDateToDDMMYYYY(order.createdAt)}
            </div>
          </div>
        </div>

        <div
          style={{
            border: "1px solid #d1d5db",
            borderRadius: 12,
            padding: 16,
            marginBottom: 20,
            background: "rgba(249, 250, 251, 0.92)",
          }}
        >
          <div style={{ fontSize: 15, marginBottom: 6 }}>
            <b>Khách hàng:</b> {customer?.name ?? ""}
          </div>
          <div style={{ fontSize: 15, marginBottom: 6 }}>
            <b>Số điện thoại:</b> {customer?.phone ?? ""}
          </div>
          <div style={{ fontSize: 15 }}>
            <b>Địa chỉ:</b> {customer?.address ?? ""}
          </div>
        </div>

        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginBottom: 20,
            fontSize: 14,
            background: "rgba(255,255,255,0.92)",
          }}
        >
          <thead>
            <tr style={{ background: "#facc15" }}>
              {[
                "STT",
                "Nội dung",
                "Đơn vị",
                "Chiều dài",
                "Số lượng",
                "Tổng SL",
                "Đơn giá",
                "Thành tiền",
              ].map((title) => (
                <th
                  key={title}
                  style={{
                    border: "1px solid #d1d5db",
                    padding: "10px 8px",
                    textAlign: "center",
                    fontWeight: 700,
                  }}
                >
                  {title}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {details.map((item) => (
              <tr key={item.stt}>
                <td style={cellCenter}>{item.stt}</td>
                <td style={cellLeft}>{item.name}</td>
                <td style={cellCenter}>{item.baseUnit || "-"}</td>
                <td style={cellCenter}>
                  {item.length ? formatQuantity(item.length) : "-"}
                </td>
                <td style={cellCenter}>
                  {item.quantity ? formatQuantity(item.quantity) : "-"}
                </td>
                <td style={cellCenter}>
                  {item.totalQuantity ? formatQuantity(item.totalQuantity) : "-"}
                </td>
                <td style={cellRight}>
                  {item.price ? formatMoney(item.price) : "-"}
                </td>
                <td style={cellRight}>
                  {item.subtotal ? formatMoney(item.subtotal) : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <div
            style={{
              minWidth: 360,
              border: "1px solid #d1d5db",
              borderRadius: 12,
              padding: 16,
              background: "rgba(255,255,255,0.92)",
            }}
          >
            {Number(order.subtotal ?? 0) > 0 && (
              <SummaryRow
                label="Tạm tính"
                value={formatMoney(Number(order.subtotal ?? 0))}
              />
            )}

            {Number(order.tax ?? 0) > 0 && (
              <SummaryRow
                label={`Thuế GTGT (${Number(order.tax ?? 0)}%)`}
                value={formatMoney(Number(order.taxAmount ?? 0))}
              />
            )}

            {Number(order.shippingFee ?? 0) > 0 && (
              <SummaryRow
                label="Phí vận chuyển"
                value={formatMoney(Number(order.shippingFee ?? 0))}
              />
            )}

            {Number(order.total ?? 0) > 0 && (
              <SummaryRow
                label="Tổng cộng"
                value={formatMoney(Number(order.total ?? 0))}
              />
            )}

            {Number(order.paidAmount ?? 0) > 0 && (
              <SummaryRow
                label="Đã thanh toán"
                value={formatMoney(Number(order.paidAmount ?? 0))}
              />
            )}

            <SummaryRow
              label="Cần thanh toán"
              value={formatMoney(Number(order.remainingAmount ?? 0))}
              strong
            />
          </div>
        </div>

        {!!order.note && (
          <div style={{ marginTop: 16, fontSize: 15 }}>
            <b>Ghi chú:</b> {order.note}
          </div>
        )}
      </div>
    </div>
  );
}

function WatermarkPattern() {
  const items = Array.from({ length: 12 });

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        zIndex: 0,
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        alignItems: "center",
        justifyItems: "center",
        padding: "24px 12px",
      }}
    >
      {items.map((_, index) => (
        <div
          key={index}
          style={{
            transform: "rotate(-24deg)",
            opacity: 0.09,
            fontSize: 26,
            fontWeight: 700,
            color: "#000000",
            whiteSpace: "nowrap",
            userSelect: "none",
          }}
        >
          BẢN KHÔNG CHÍNH THỨC
        </div>
      ))}
    </div>
  );
}

function CenterLogoWatermark() {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: "none",
        zIndex: 0,
      }}
    >
      <div
        style={{
          transform: "rotate(-24deg)",
          textAlign: "center",
          opacity: 0.07,
        }}
      >
        <div
          style={{
            fontSize: 34,
            fontWeight: 800,
            letterSpacing: 2,
            color: "#000000",
          }}
        >
          BẢN KHÔNG CHÍNH THỨC
        </div>
      </div>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: 16,
        marginBottom: 8,
        fontSize: strong ? 16 : 15,
        fontWeight: strong ? 700 : 500,
      }}
    >
      <span>{label}:</span>
      <span>{value}</span>
    </div>
  );
}

const baseCell: CSSProperties = {
  border: "1px solid #d1d5db",
  padding: "10px 8px",
  verticalAlign: "top",
};

const cellCenter: CSSProperties = {
  ...baseCell,
  textAlign: "center",
};

const cellLeft: CSSProperties = {
  ...baseCell,
  textAlign: "left",
};

const cellRight: CSSProperties = {
  ...baseCell,
  textAlign: "right",
};