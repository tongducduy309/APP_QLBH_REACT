import { useCallback, useEffect, useState } from "react";
import {
  Eye,
  FileClock,
  RefreshCcw,
  Search,
  PlusCircle,
  Pencil,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import type {
  DatabaseAction,
  DatabaseChangeLog,
} from "../types/database-change-log.types";
import { getDatabaseChangeLogs } from "@/services/database-api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const PAGE_SIZE = 20;

function formatDateTime(value?: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("vi-VN");
}

function prettyJson(value?: string | null) {
  if (!value) return "Không có dữ liệu";

  try {
    return JSON.stringify(JSON.parse(value), null, 2);
  } catch {
    return value;
  }
}

function getActionLabel(action: DatabaseAction) {
  switch (action) {
    case "CREATE":
      return "Tạo mới";
    case "UPDATE":
      return "Cập nhật";
    case "DELETE":
      return "Xóa";
    default:
      return action;
  }
}

function getActionIcon(action: DatabaseAction) {
  switch (action) {
    case "CREATE":
      return <PlusCircle className="h-4 w-4 text-green-600" />;
    case "UPDATE":
      return <Pencil className="h-4 w-4 text-blue-600" />;
    case "DELETE":
      return <Trash2 className="h-4 w-4 text-red-600" />;
    default:
      return null;
  }
}

function getActionClass(action: DatabaseAction) {
  switch (action) {
    case "CREATE":
      return "border-green-200 bg-green-50 text-green-700";
    case "UPDATE":
      return "border-blue-200 bg-blue-50 text-blue-700";
    case "DELETE":
      return "border-red-200 bg-red-50 text-red-700";
    default:
      return "border-slate-200 bg-slate-50 text-slate-700";
  }
}

export default function DatabaseChangeLogPage() {
  const [logs, setLogs] = useState<DatabaseChangeLog[]>([]);
  const [selectedLog, setSelectedLog] = useState<DatabaseChangeLog | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const [entityName, setEntityName] = useState("");
  const [action, setAction] = useState<DatabaseAction | "">("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const res = await getDatabaseChangeLogs({
        page,
        size: PAGE_SIZE,
        entityName: entityName.trim(),
        action: action === "" ? undefined : action,
        fromDate: fromDate.trim(),
        toDate: toDate.trim(),
      });

      setLogs(res.content ?? []);
      setTotalPages(res.totalPages ?? 0);
      setTotalElements(res.totalElements ?? 0);
    } catch (err) {
      console.error(err);
      setError("Không thể tải lịch sử thay đổi dữ liệu.");
      setLogs([]);
      setTotalPages(0);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  }, [page, entityName, action, fromDate, toDate]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  function resetFilter() {
    setPage(0);
    setEntityName("");
    setAction("");
    setFromDate("");
    setToDate("");
  }

  return (
    <div className="space-y-5 p-4 md:p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <FileClock className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">
              Lịch sử thay đổi dữ liệu
            </h1>
          </div>

          <p className="mt-1 text-sm text-muted-foreground">
            Theo dõi thao tác tạo mới, cập nhật và xóa dữ liệu trong hệ thống.
          </p>
        </div>

        <Button
          variant="outline"
          onClick={fetchLogs}
          disabled={loading}
          className="gap-2"
        >
          <RefreshCcw className="h-4 w-4" />
          Làm mới
        </Button>
      </div>

      <div className="rounded-xl border bg-card p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-5">
          <div className="relative md:col-span-2">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

            <Input
              value={entityName}
              onChange={(e) => {
                setPage(0);
                setEntityName(e.target.value);
              }}
              placeholder="Tìm entity: Product, Order, Customer..."
              className="pl-9"
            />
          </div>

          <Select
            value={action || "ALL"}
            onValueChange={(value) => {
              setPage(0);
              setAction(value === "ALL" ? "" : (value as DatabaseAction));
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Loại thao tác" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="ALL">Tất cả thao tác</SelectItem>
              <SelectItem value="CREATE">Tạo mới</SelectItem>
              <SelectItem value="UPDATE">Cập nhật</SelectItem>
              <SelectItem value="DELETE">Xóa</SelectItem>
            </SelectContent>
          </Select>

          <Input
            type="date"
            value={fromDate}
            onChange={(e) => {
              setPage(0);
              setFromDate(e.target.value);
            }}
          />

          <Input
            type="date"
            value={toDate}
            onChange={(e) => {
              setPage(0);
              setToDate(e.target.value);
            }}
          />
        </div>

        <div className="mt-3 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Tổng cộng: {totalElements} lịch sử
          </p>

          <Button variant="ghost" onClick={resetFilter}>
            Xóa bộ lọc
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Thời gian</TableHead>
              <TableHead>Entity</TableHead>
              <TableHead>Thao tác</TableHead>
              <TableHead>Người thực hiện</TableHead>
              <TableHead>Nội dung</TableHead>
              <TableHead className="text-right">Chi tiết</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  Đang tải dữ liệu...
                </TableCell>
              </TableRow>
            ) : logs.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-24 text-center text-muted-foreground"
                >
                  Không có lịch sử thay đổi
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="whitespace-nowrap">
                    {formatDateTime(log.createdAt)}
                  </TableCell>

                  <TableCell>
                    <div className="font-medium">{log.entityName}</div>
                    <div className="text-xs text-muted-foreground">
                      ID: {log.entityId || "-"}
                    </div>
                  </TableCell>

                  <TableCell>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-medium ${getActionClass(
                        log.action
                      )}`}
                    >
                      {getActionIcon(log.action)}
                      {getActionLabel(log.action)}
                    </span>
                  </TableCell>

                  <TableCell>
                    <div className="font-medium">
                      {log.actorName || "SYSTEM"}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {log.employeeCode || log.actorUsername || "-"}
                    </div>
                  </TableCell>

                  <TableCell className="max-w-[380px]">
                    <p className="line-clamp-2 text-sm">{log.content}</p>
                  </TableCell>

                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedLog(log)}
                      className="gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      Xem
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Trang {page + 1} / {Math.max(totalPages, 1)}
        </p>

        <div className="flex gap-2">
          <Button
            variant="outline"
            disabled={page <= 0 || loading}
            onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
          >
            Trước
          </Button>

          <Button
            variant="outline"
            disabled={page + 1 >= totalPages || loading}
            onClick={() => setPage((prev) => prev + 1)}
          >
            Sau
          </Button>
        </div>
      </div>

      <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <DialogContent className="max-h-[90vh] max-w-5xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chi tiết thay đổi dữ liệu</DialogTitle>
          </DialogHeader>

          {selectedLog && (
            <div className="space-y-5">
              <div className="grid gap-3 rounded-lg border p-4 md:grid-cols-2">
                <Info label="Entity">
                  {selectedLog.entityName} #{selectedLog.entityId || "-"}
                </Info>

                <Info label="Thao tác">
                  {getActionLabel(selectedLog.action)}
                </Info>

                <Info label="Người thực hiện">
                  {selectedLog.actorName || "SYSTEM"}
                </Info>

                <Info label="Mã nhân viên / Username">
                  {selectedLog.employeeCode || selectedLog.actorUsername || "-"}
                </Info>

                <Info label="Thời gian">
                  {formatDateTime(selectedLog.createdAt)}
                </Info>

                <Info label="IP">
                  {selectedLog.ipAddress || "-"}
                </Info>

                <div className="md:col-span-2">
                  <p className="text-xs text-muted-foreground">User Agent</p>
                  <p className="break-all text-sm">
                    {selectedLog.userAgent || "-"}
                  </p>
                </div>
              </div>

              <div>
                <p className="mb-2 text-sm font-medium">Nội dung thay đổi</p>
                <div className="rounded-lg border bg-muted/40 p-3 text-sm">
                  {selectedLog.content}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <JsonBlock title="Dữ liệu cũ" value={selectedLog.oldValue} />
                <JsonBlock title="Dữ liệu mới" value={selectedLog.newValue} />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Info({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium">{children}</p>
    </div>
  );
}

function JsonBlock({
  title,
  value,
}: {
  title: string;
  value?: string | null;
}) {
  return (
    <div>
      <p className="mb-2 text-sm font-medium">{title}</p>
      <pre className="max-h-[420px] overflow-auto rounded-lg border bg-slate-950 p-4 text-xs text-slate-100">
        {prettyJson(value)}
      </pre>
    </div>
  );
}