import { useEffect, useMemo, useRef, useState } from "react";
import { DatePicker, Input, Space, Table, Tag } from "antd";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import { Check, CheckCheck, CircleDollarSign, Copy, Download, Eye, FileDown, Flag, Mail, MoreHorizontal, Pencil, Printer, QrCode, Search, Trash2 } from "lucide-react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

import { PageShell } from "@/components/layout/page-shell";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getOrders } from "@/services/order-api";
import { formatCurrency } from "@/lib/utils";
import { removeVietnameseTones } from "@/utils/string";
import { OrderRes, OrderStatus } from "@/types/order";
import { formatDateToDDMMYYYY } from "@/utils/date";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getSepayTransactions } from "@/services/sepay-api";

import { BankAccount } from "../types/bank.types";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { FieldLabel, Field, FieldContent, FieldTitle, FieldDescription } from "@/components/ui/field";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

import { toast } from "sonner";
import * as htmlToImage from "html-to-image";
import { SepayTransaction } from "../types/sepay.types";
import { createBankAccount, deleteBankAccount, getBankAccounts, setDefaultBankAccount } from "@/services/bank-account-api";
import { useAppSettingsStore } from "@/features/settings/store/app-settings-store";
import { formatTransferCode } from "@/features/settings/utils/bank.help";
import { AddBankAccountDialog } from "../components/AddBankAccountDialog";
dayjs.extend(isBetween);

const { RangePicker } = DatePicker;
const PAGE_SIZE = 10;



const initialBankAccounts: BankAccount[] = [
  {
    id: "1",
    bankCode: "Sacombank",
    accountNumber: "060280886699",
    bankName: "Sacombank",
    bankAccountName: "NGUYỄN HOÀNG ANH",
    active: true,
    isDefault: true,
  },
  {
    id: "2",
    bankCode: "VPBank",
    accountNumber: "060280886699",
    bankName: "VPBank",
    bankAccountName: "NGUYỄN HOÀNG ANH",
    active: true,
    isDefault: false,
  },
  {
    id: "3",
    bankCode: "Techcombank",
    accountNumber: "123456789012",
    bankName: "Techcombank",
    bankAccountName: "NGUYỄN HOÀNG ANH",
    active: false,
    isDefault: false,
  },
  {
    id: "4",
    bankCode: "Vietcombank",
    accountNumber: "123456789012",
    bankName: "Vietcombank",
    bankAccountName: "NGUYỄN HOÀNG ANH",
    active: false,
    isDefault: false,
  },
];


function OrderHistoryTable() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [orders, setOrders] = useState<OrderRes[]>([]);
  const [loading, setLoading] = useState(false);

  const keywordParam = searchParams.get("keyword") || "";
  const fromParam = searchParams.get("from") || "";
  const toParam = searchParams.get("to") || "";
  const pageParam = Number(searchParams.get("page") || "1");

  const [keyword, setKeyword] = useState(keywordParam);
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null] | null>(
    fromParam || toParam
      ? [
        fromParam ? dayjs(fromParam, "YYYY-MM-DD") : null,
        toParam ? dayjs(toParam, "YYYY-MM-DD") : null,
      ]
      : null
  );

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const res = await getOrders();
        setOrders(res);
      } catch (error) {
        console.error("Lỗi lấy lịch sử giao dịch", error);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  useEffect(() => {
    setKeyword(keywordParam);
    setDateRange(
      fromParam || toParam
        ? [
          fromParam ? dayjs(fromParam, "YYYY-MM-DD") : null,
          toParam ? dayjs(toParam, "YYYY-MM-DD") : null,
        ]
        : null
    );
  }, [keywordParam, fromParam, toParam]);

  const updateSearchParams = (next: {
    keyword?: string;
    from?: string;
    to?: string;
    page?: number;
  }) => {
    const params = new URLSearchParams(searchParams);

    const finalKeyword = next.keyword ?? keywordParam;
    const finalFrom = next.from ?? fromParam;
    const finalTo = next.to ?? toParam;
    const finalPage = next.page ?? pageParam;

    if (finalKeyword?.trim()) {
      params.set("keyword", finalKeyword.trim());
    } else {
      params.delete("keyword");
    }

    if (finalFrom) {
      params.set("from", finalFrom);
    } else {
      params.delete("from");
    }

    if (finalTo) {
      params.set("to", finalTo);
    } else {
      params.delete("to");
    }

    if (finalPage && finalPage > 1) {
      params.set("page", String(finalPage));
    } else {
      params.delete("page");
    }

    setSearchParams(params);
  };

  const handleKeywordChange = (value: string) => {
    setKeyword(value);
    updateSearchParams({
      keyword: value,
      page: 1,
    });
  };

  const handleDateRangeChange = (
    dates: null | (Dayjs | null)[]
  ) => {
    const nextRange: [Dayjs | null, Dayjs | null] | null =
      dates && dates.length === 2
        ? [dates[0] ?? null, dates[1] ?? null]
        : null;

    setDateRange(nextRange);

    updateSearchParams({
      from: nextRange?.[0] ? nextRange[0].format("YYYY-MM-DD") : "",
      to: nextRange?.[1] ? nextRange[1].format("YYYY-MM-DD") : "",
      page: 1,
    });
  };

  const normalizedKeyword = useMemo(
    () => removeVietnameseTones((keywordParam || "").trim()),
    [keywordParam]
  );

  const filteredOrders = useMemo(() => {
    const fromDate = fromParam ? dayjs(fromParam, "YYYY-MM-DD") : null;
    const toDate = toParam ? dayjs(toParam, "YYYY-MM-DD") : null;

    return orders.filter((order: OrderRes) => {
      const createdAt = dayjs(order.createdAt, "DD-MM-YYYY");

      const customerName = removeVietnameseTones(order.customer?.name || "");
      const phone = removeVietnameseTones(order.customer?.phone || "");
      const note = removeVietnameseTones(order.note || "");
      const orderCode = removeVietnameseTones(order.code || "");
      const detailsText = removeVietnameseTones(
        (order.details ?? []).map((d) => `${d.name} ${d.sku || ""}`).join(" ")
      );

      const matchesKeyword =
        !normalizedKeyword ||
        customerName.includes(normalizedKeyword) ||
        phone.includes(normalizedKeyword) ||
        note.includes(normalizedKeyword) ||
        orderCode.includes(normalizedKeyword) ||
        detailsText.includes(normalizedKeyword);

      const matchesDate =
        !fromDate ||
        !toDate ||
        (
          createdAt.valueOf() >= fromDate.startOf("day").valueOf() &&
          createdAt.valueOf() <= toDate.endOf("day").valueOf()
        );

      return matchesKeyword && matchesDate;
    });
  }, [orders, normalizedKeyword, fromParam, toParam]);

  const currentPage = Math.max(pageParam || 1, 1);

  const columns: ColumnsType<OrderRes> = [
    {
      title: "Mã giao dịch",
      dataIndex: "code",
      key: "code",
      width: 140,
      render: (value: string, record: OrderRes) => <div onClick={() => navigate(`/transactions/order/${record.id}`)} className="font-medium cursor-pointer hover:underline">{value}</div>,
    },
    {
      title: "Khách hàng",
      key: "customer",
      width: 220,
      render: (_, record) => (
        <div>
          {
            record.customer?.id ? (
              <div className="font-medium cursor-pointer hover:underline" onClick={() => navigate(`/customers/${record.customer?.id}`)}>{record.customer?.name || "Khách lẻ"}</div>
            ) : (
              <div className="font-medium">{record.customer?.name || "Khách lẻ"}</div>
            )
          }

          <div className="text-xs text-muted-foreground">
            {record.customer?.phone || "-"}
          </div>
        </div>
      ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 180,
      render: (value: string) => formatDateToDDMMYYYY(value),
    },
    {
      title: "Đã thanh toán",
      dataIndex: "paidAmount",
      key: "paidAmount",
      width: 140,
      render: (value: number) => formatCurrency(value ?? 0),
    },
    {
      title: "Còn lại",
      dataIndex: "remainingAmount",
      key: "remainingAmount",
      width: 140,
      render: (value: number) => (
        <Tag color={(value ?? 0) > 0 ? "red" : "green"}>
          {formatCurrency(value ?? 0)}
        </Tag>
      ),
    },
    {
      title: "Tổng tiền",
      dataIndex: "total",
      key: "total",
      width: 140,
      render: (value: number) => (
        <span className="font-semibold">{formatCurrency(value ?? 0)}</span>
      ),
    },
    {
      title: "Thanh toán",
      key: "paymentStatus",
      width: 160,
      render: (_, record) => {
        const remaining = record.remainingAmount ?? 0;
        const paidAmount = record.paidAmount ?? 0;

        if (remaining <= 0) {
          return <Tag color="green">Đã thanh toán</Tag>;
        }

        if (paidAmount > 0) {
          return <Tag color="orange">Thanh toán một phần</Tag>;
        }

        return <Tag color="red">Chưa thanh toán</Tag>;
      },
    },
    {
      title: "Trạng thái",
      key: "status",
      width: 120,
      render: (_, record) => (
        <Tag color={record.status === OrderStatus.CONFIRMED ? "green" : "red"}>
          {record.status === OrderStatus.CONFIRMED ? "Chính thức" : "Bản nháp"}
        </Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      width: 140,
      fixed: "right",
      render: (_, record) => (
        <Button
          variant="link"
          onClick={() =>
            navigate(`/transactions/order/${record.id}${window.location.search}`)
          }
        >
          Xem chi tiết
        </Button>
      ),
    },
  ];

  const handleTableChange = (pagination: TablePaginationConfig) => {
    updateSearchParams({
      page: pagination.current || 1,
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <CardTitle>Lịch sử giao dịch</CardTitle>
          <CardDescription>
            Theo dõi các hóa đơn đã tạo từ hệ thống
          </CardDescription>
        </div>

        <Space wrap>
          <Input
            allowClear
            value={keyword}
            onChange={(e) => handleKeywordChange(e.target.value)}
            placeholder="Tìm mã đơn, khách hàng, SĐT, sản phẩm..."
            prefix={<Search className="h-4 w-4" />}
            className="w-[280px]"
          />

          <RangePicker
            format="DD/MM/YYYY"
            value={dateRange}
            onChange={handleDateRangeChange}
          />
        </Space>
      </CardHeader>

      <CardContent>
        <Table<OrderRes>
          rowKey="id"
          columns={columns}
          dataSource={filteredOrders}
          loading={loading}
          onChange={handleTableChange}
          pagination={{
            current: currentPage,
            pageSize: PAGE_SIZE,
            total: filteredOrders.length,
            showSizeChanger: false,
          }}
          scroll={{ x: 1300 }}
          expandable={{
            expandedRowRender: (record) => (
              <Table
                rowKey={(detail) => detail.id}
                pagination={false}
                size="small"
                dataSource={record.details ?? []}
                columns={[
                  {
                    title: "Tên sản phẩm",
                    dataIndex: "name",
                    key: "name",
                    render: (value: string, detail) => (
                      <div>
                        <div className="font-medium">{value || "-"}</div>
                        <div className="text-xs text-muted-foreground">
                          SKU: {detail.sku || "-"}
                        </div>
                      </div>
                    ),
                  },
                  {
                    title: "Mã kho",
                    dataIndex: "inventoryCode",
                    key: "inventoryCode",
                    render: (value: string | null) => value ?? "-",
                  },
                  {
                    title: "Chiều dài",
                    dataIndex: "length",
                    key: "length",
                    render: (value: number) => value ?? 0,
                  },
                  {
                    title: "Số lượng",
                    dataIndex: "quantity",
                    key: "quantity",
                    render: (value: number) => value ?? 0,
                  },
                  {
                    title: "Tổng số lượng",
                    dataIndex: "totalQuantity",
                    key: "totalQuantity",
                    render: (_: number, detail) =>
                      (detail.quantity ?? 0) * (detail.length || 1),
                  },
                  {
                    title: "Đơn vị",
                    dataIndex: "baseUnit",
                    key: "baseUnit",
                    render: (value: string) => value || "-",
                  },
                  {
                    title: "Đơn giá",
                    dataIndex: "price",
                    key: "price",
                    render: (value: number) => formatCurrency(value ?? 0),
                  },
                  {
                    title: "Thành tiền",
                    key: "lineTotal",
                    render: (_, detail) =>
                      formatCurrency(
                        (detail.price ?? 0) *
                        (detail.quantity ?? 0) *
                        (detail.length || 1)
                      ),
                  },
                ]}
              />
            ),
            rowExpandable: (record) => (record.details?.length ?? 0) > 0,
          }}
          locale={{
            emptyText: "Chưa có giao dịch",
          }}
        />
      </CardContent>
    </Card>

  );
}


function BankAccountsSetting() {
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>(initialBankAccounts);

  const [openBankDialog, setOpenBankDialog] = useState(false);

  const qrRef = useRef<HTMLDivElement | null>(null);

  const [selectedAccountId, setSelectedAccountId] = useState<string>();

  const [copiedQr, setCopiedQr] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const selectedAccount = useMemo(() => {
    return bankAccounts.find((item) => item.id === selectedAccountId) ?? null;
  }, [bankAccounts, selectedAccountId]);

  const qrUrl = useMemo(() => {
    if (!selectedAccount) return "";

    const bankCode = encodeURIComponent(selectedAccount.bankCode);
    const accountNumber = encodeURIComponent(selectedAccount.accountNumber);
    const accountName = encodeURIComponent(selectedAccount.bankAccountName);

    return `https://img.vietqr.io/image/${bankCode}-${accountNumber}-compact1.png?accountName=${accountName}`;
  }, [selectedAccount]);

  const handleAddBankAccount = (account: BankAccount) => {
    createBankAccount(account).then((newAccount) => {
      setBankAccounts((prev) => [...prev, newAccount]);
      setSelectedAccountId(newAccount.id);
      toast.success("Thêm tài khoản ngân hàng thành công");
    }).catch((error) => {
      console.error(error.message);
    });

  };

  const handleDeleteBankAccount = (id: string) => {
    deleteBankAccount(id).then(() => {
      setBankAccounts((prev) => prev.filter((item) => item.id !== id));
      toast.success("Xóa tài khoản ngân hàng thành công");
    }).catch((error) => {
      console.error(error.message);
    });
  };

  const handleSetDefaultBankAccount = async (id: string) => {
    await setDefaultBankAccount(id).then(() => {
      setBankAccounts((prev) =>
        prev.map((item) =>
          item.id === id
            ? { ...item, isDefault: true }
            : { ...item, isDefault: false }
        )
      );
      toast.success("Thiết lập tài khoản mặc định thành công");
    }).catch((error: any) => {
      console.error(error.message);
    });
  };

  const sortedBankAccounts = useMemo(() => {
    return [...bankAccounts].sort((a, b) => {
      if (a.isDefault) return -1;
      if (b.isDefault) return 1;
      return 0;
    });
  }, [bankAccounts]);


  const copyQrImage = async () => {
    if (!qrRef.current) return;

    try {
      const dataUrl = await htmlToImage.toPng(qrRef.current);
      const blob = await (await fetch(dataUrl)).blob();

      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob,
        }),
      ]);

      setCopiedQr(true);

      setTimeout(() => {
        setCopiedQr(false);
      }, 2000);
    } catch (error) {
      console.error("Copy QR failed:", error);
    }
  };

  const downloadQrImage = async () => {
    if (!qrRef.current) return;

    try {
      const dataUrl = await htmlToImage.toPng(qrRef.current);

      const link = document.createElement("a");
      link.download = `transfer-${selectedAccount?.accountNumber}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Download QR failed:", error);
    }
  };

  useEffect(() => {
    getBankAccounts().then((accounts) => {
      setBankAccounts(accounts);
      if (accounts.length > 0) {
        setSelectedAccountId(accounts.find((item) => item.isDefault)?.id ?? accounts[0].id);
      }
    });
  }, []);

  return (
    <>
      <Card className="overflow-hidden border bg-white shadow-sm">
        <CardHeader className="border-b bg-muted/30">
          <div>
            <CardTitle className="text-xl">Tài khoản ngân hàng</CardTitle>
            <CardDescription>
              Quét mã QR để chuyển khoản qua tài khoản đã chọn
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <div className="flex w-full  flex-col gap-6 lg:flex-row">
            <div className="grid flex-1 gap-6 rounded-2xl border bg-white p-4 shadow-sm md:grid-cols-[260px_1fr] md:items-center">
              <div className="flex justify-center flex-col items-center gap-2">
                {qrUrl ? (
                  <div ref={qrRef} >
                    <img
                    src={qrUrl}
                    alt="VietQR thanh toán"
                    className="h-[240px] w-[240px] object-contain"
                    crossOrigin="anonymous"
                  />
                  </div>

                ) : (
                  <div className="flex h-[240px] w-[240px] items-center justify-center rounded-xl bg-muted text-sm text-muted-foreground">
                    Chưa có QR
                  </div>
                )}

                {qrUrl && (
                  <div className="flex w-full gap-2">
                    <Button variant="outline" className="flex-1" onClick={copyQrImage}>
                      {copiedQr ? (
                        <>
                          <Check className="mr-2 h-4 w-4 text-green-600" />
                          Đã sao chép
                        </>
                      ) : (
                        <>
                          <Copy className="mr-2 h-4 w-4" />
                          Sao chép QR
                        </>
                      )}
                    </Button>

                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={downloadQrImage}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Tải ảnh
                    </Button>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Ngân hàng</p>
                  <p className="font-semibold">{selectedAccount?.bankName ?? "-"}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Chủ tài khoản</p>
                  <p className="font-semibold">
                    {selectedAccount?.bankAccountName ?? "-"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Số tài khoản</p>
                  <p className="font-semibold">
                    {selectedAccount?.accountNumber ?? "-"}
                  </p>
                </div>
              </div>
            </div>

            <div className="w-full lg:max-w-sm">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Danh sách tài khoản</h3>
                  <p className="text-sm text-muted-foreground">
                    Chọn tài khoản để hiển thị QR
                  </p>
                </div>

                <Button
                  size="sm"
                  onClick={() => setOpenBankDialog(true)}
                >
                  + Thêm
                </Button>
              </div>

              <div className="relative">

                {
                  sortedBankAccounts.length == 0 ? (
                    <div className="flex items-center justify-center h-[280px]">
                      <p className="text-sm text-muted-foreground">Chưa có tài khoản ngân hàng nào được thêm vào hệ thống</p>
                    </div>
                  ) : (
                    <>
                      <div className="pointer-events-none absolute top-0 z-10 h-6 w-full bg-gradient-to-b from-background to-transparent" />

                      <div className="pointer-events-none absolute bottom-0 z-10 h-6 w-full bg-gradient-to-t from-background to-transparent" />
                      <div className="max-h-[280px] overflow-y-auto pr-2 py-3">
                        <RadioGroup
                          value={selectedAccountId}
                          onValueChange={setSelectedAccountId}
                          className="space-y-1"
                        >
                          {sortedBankAccounts.map((account) => (
                            <FieldLabel
                              key={account.id}
                              htmlFor={account.id}
                              className="block cursor-pointer"
                            >
                              <Field
                                orientation="horizontal"
                                className="items-center rounded-xl p-4 transition hover:bg-muted/40 relative"
                              >
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button size={"sm"} variant={"ghost"} className="absolute top-1 right-1">
                                      <MoreHorizontal />
                                    </Button>
                                  </DropdownMenuTrigger>

                                  <DropdownMenuContent align="end" className="w-52">
                                    <DropdownMenuGroup>


                                      {
                                        !account.isDefault ? (
                                          <DropdownMenuItem onClick={() => handleSetDefaultBankAccount(account.id)}>
                                            <Flag className="mr-2 h-4 w-4" />
                                            Đặt mặc định
                                          </DropdownMenuItem>
                                        ) : null
                                      }

                                      {
                                        !account.isDefault && (<DropdownMenuSeparator />)
                                      }

                                      <DropdownMenuItem
                                        onClick={() => handleDeleteBankAccount(account.id)}
                                        variant="destructive"
                                      >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Xóa tài khoản
                                      </DropdownMenuItem>

                                    </DropdownMenuGroup>
                                  </DropdownMenuContent>
                                </DropdownMenu>

                                <FieldContent>
                                  <FieldTitle>
                                    <div className="flex items-center gap-2">
                                      <div className="flex gap-2 items-center">
                                        <span>{account.accountNumber} ({account.bankName})</span>
                                        {account.isDefault && (
                                          <span className="text-xs font-medium text-muted-foreground">Mặc định</span>
                                        )}
                                      </div>
                                    </div>
                                  </FieldTitle>

                                  <FieldDescription>
                                    {account.bankAccountName}
                                  </FieldDescription>
                                </FieldContent>

                                <RadioGroupItem
                                  value={account.id}
                                  id={account.id}
                                  className="hidden"
                                />
                              </Field>
                            </FieldLabel>
                          ))}
                        </RadioGroup>
                      </div>
                    </>)
                }
              </div>


            </div>
          </div>
        </CardContent>
      </Card>

      <AddBankAccountDialog
        open={openBankDialog}
        onOpenChange={setOpenBankDialog}
        onAddBankAccount={handleAddBankAccount}
      />
    </>
  );
}


function BankTransactionsTable() {
  const [sepayTransactions, setSepayTransactions] = useState<SepayTransaction[]>([]);
  const [keyword, setKeyword] = useState("");

  const [bankAccounts, setBankAccounts] =
    useState<BankAccount[]>(initialBankAccounts);

  const defaultBankAccount = bankAccounts.find((item) => item.isDefault);



  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);


  const filteredTransactions = useMemo(() => {
    const normalizedKeyword = removeVietnameseTones(keyword.trim());

    if (!normalizedKeyword) return sepayTransactions;

    return sepayTransactions.filter((item) => {
      const searchable = removeVietnameseTones(
        [
          item.transaction_content,
          item.reference_number,
          item.account_number,
          item.bank_brand_name,
        ].join(" ")
      );

      return searchable.includes(normalizedKeyword);
    });
  }, [keyword, sepayTransactions]);


  const columns: ColumnsType<SepayTransaction> = [
    {
      title: "Thời gian",
      dataIndex: "transaction_date",
      key: "transaction_date",
      width: 180,
      render: (value: string) => dayjs(value).format("DD/MM/YYYY HH:mm:ss"),
    },
    {
      title: "Ngân hàng",
      key: "bank",
      width: 180,
      render: (_, record) => (
        <div>
          <div className="font-medium">{record.bank_brand_name}</div>
          <div className="text-xs text-muted-foreground">
            {record.account_number}
          </div>
        </div>
      ),
    },
    {
      title: "Loại",
      dataIndex: "transfer_type",
      key: "transfer_type",
      width: 110,
      render: (value: SepayTransaction["transfer_type"]) =>
        value === "in" ? (
          <Tag color="green">Tiền vào</Tag>
        ) : (
          <Tag color="red">Tiền ra</Tag>
        ),
    },
    {
      title: "Số tiền vào",
      dataIndex: "amount_in",
      key: "amount_in",
      width: 140,
      render: (value: number) => (
        <span className="font-semibold text-green-600">
          {formatCurrency(value ?? 0)}
        </span>
      ),
    },
    {
      title: "Số tiền ra",
      dataIndex: "amount_out",
      key: "amount_out",
      width: 140,
      render: (value: number) => formatCurrency(value ?? 0),
    },
    {
      title: "Nội dung",
      dataIndex: "transaction_content",
      key: "transaction_content",
      width: 200,
    },
    {
      title: "Mã tham chiếu",
      dataIndex: "reference_number",
      key: "reference_number",
      width: 180,
    },
    // {
    //   title: "Webhook",
    //   dataIndex: "webhook_success",
    //   key: "webhook_success",
    //   width: 130,
    //   render: (value: 0 | 1) =>
    //     value === 1 ? (
    //       <Tag color="success">Thành công</Tag>
    //     ) : (
    //       <Tag color="warning">Chưa xử lý</Tag>
    //     ),
    // },
    {
      title: "Liên kết",
      dataIndex: "",
      key: "orderCode",
      width: 130,
      render: (_, record) => {
        const orderCode = formatTransferCode(record.transaction_content);

        return (
          <div>
            {orderCode !== record.transaction_content ? (
              <div
                className="font-medium cursor-pointer hover:underline text-primary"
                onClick={() => navigate(`/transactions/order/${orderCode}`)}
              >
                {orderCode}
              </div>
            ) : (
              <div className="font-medium">-</div>
            )}
          </div>
        );
      },
    },
  ];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await getSepayTransactions().then((res) => setSepayTransactions(res)).catch((error) => {
        console.error("Lỗi lấy danh sách giao dịch ngân hàng", error);
      }).finally(() => {
        setLoading(false);
      });
    };
    fetchData();
  }, []);

  return (
    <>
      <div className="mb-4">
        <BankAccountsSetting />
      </div>
      <Card>
        <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>Giao dịch ngân hàng</CardTitle>
            <CardDescription>
              Danh sách giao dịch được lấy từ SePay
            </CardDescription>
          </div>

          <div className="flex flex-col gap-2 md:flex-row md:items-center">
            <Input
              allowClear
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Tìm nội dung, mã tham chiếu, số tài khoản..."
              prefix={<Search className="h-4 w-4" />}
              className="w-[320px]"
            />


          </div>
        </CardHeader>

        <CardContent>
          <Table<SepayTransaction>
            rowKey="id"
            columns={columns}
            dataSource={filteredTransactions}
            pagination={{ pageSize: 10, showSizeChanger: false }}
            loading={loading}
            scroll={{ x: 1200 }}
            locale={{
              emptyText: "Chưa có giao dịch ngân hàng",
            }}
            onRow={(record) => ({
            onClick: () => {
              const key = record.id;

              navigate(`/transactions/bank-transfer/${key}`);
            },
          })}
          />
        </CardContent>
      </Card>
      </>

  );
}

export function TransactionsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const tab = searchParams.get("tab") ?? "orders";

  const appSettingsStore = useAppSettingsStore();

  return (
    <PageShell>
      {appSettingsStore.appSettings.fh ? (
        <OrderHistoryTable />
      ) : (
        <Tabs value={tab} onValueChange={(value) => setSearchParams({ tab: value })}>
        <TabsList>
          <TabsTrigger value="orders">Lịch sử giao dịch</TabsTrigger>
          <TabsTrigger value="bank">Ngân hàng</TabsTrigger>
        </TabsList>
        <TabsContent value="orders">
          <OrderHistoryTable />
        </TabsContent>

        <TabsContent value="bank">
          <BankTransactionsTable />
        </TabsContent>
      </Tabs>
      )}
    </PageShell>
  );
}