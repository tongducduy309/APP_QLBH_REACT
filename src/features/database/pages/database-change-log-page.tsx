import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Button,
  Card,
  DatePicker,
  Descriptions,
  Drawer,
  Empty,
  Input,
  Select,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  EyeOutlined,
  FileSearchOutlined,
  ReloadOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

import type {
  DatabaseAction,
  DatabaseChangeLog,
} from "../types/database-change-log.types";
import { getDatabaseChangeLogs } from "@/services/database-api";
import { formatDateTimeDDMMYYYY_HHMMSS } from "@/utils/date";
import { renderChangeLog } from "@/utils/format";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const PAGE_SIZE = 20;

function prettyJson(value?: string | null) {
  if (!value) return "Không có dữ liệu";

  try {
    return JSON.stringify(JSON.parse(value), null, 2);
  } catch {
    return value;
  }
}

function getLink(entityName: string, entityId: string|null) {
  switch (entityName) {
    case "ORDER":
      return `/transactions/order/${entityId}`;
    case "BANK_TRANSFER":
      return `/transactions/bank-transfer/${entityId}`;
    case "CUSTOMER":
      return `/customers/${entityId}`;
    case "PRODUCT":
      return `/inventory/${entityId}`;
    case "EMPLOYEE":
      return `/employees/${entityId}`;
    case "PURCHASE_RECEIPT":
      return `/purchase-receipts/${entityId}`;
    default:
      return undefined;
  }
}

function getActionLabel(action: DatabaseAction) {
  switch (action) {
    case "CREATE":
      return "TẠO MỚI";
    case "UPDATE":
      return "CẬP NHẬT";
    case "DELETE":
      return "XÓA";
    default:
      return action;
  }
}

function getActionColor(action: DatabaseAction) {
  switch (action) {
    case "CREATE":
      return "green";
    case "UPDATE":
      return "blue";
    case "DELETE":
      return "red";
    default:
      return "default";
  }
}

export default function DatabaseChangeLogPage() {
  const [logs, setLogs] = useState<DatabaseChangeLog[]>([]);
  const [selectedLog, setSelectedLog] = useState<DatabaseChangeLog | null>(null);

  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const [keyword, setKeyword] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState("");

  const [action, setAction] = useState<DatabaseAction | "ALL">("ALL");
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(
    null,
  );

  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(0);
      setDebouncedKeyword(keyword.trim());
    }, 500);

    return () => clearTimeout(timer);
  }, [keyword]);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);

      const res = await getDatabaseChangeLogs({
        page,
        size: PAGE_SIZE,
        keyword: debouncedKeyword || undefined,
        action: action === "ALL" ? undefined : action,
        fromDate: dateRange ? dateRange[0].format("YYYY-MM-DD") : undefined,
        toDate: dateRange ? dateRange[1].format("YYYY-MM-DD") : undefined,
      });

      setLogs(Array.isArray(res.content) ? res.content : []);
      setTotalElements(res.totalElements ?? 0);
    } catch (error) {
      console.error(error);
      message.error("Không thể tải lịch sử thay đổi dữ liệu");
      setLogs([]);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedKeyword, action, dateRange]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  function resetFilter() {
    setPage(0);
    setKeyword("");
    setDebouncedKeyword("");
    setAction("ALL");
    setDateRange(null);
  }

  const columns = useMemo<ColumnsType<DatabaseChangeLog>>(
    () => [
      {
        title: "Thời gian",
        dataIndex: "createdAt",
        width: 180,
        render: (value) => formatDateTimeDDMMYYYY_HHMMSS(value),
      },
      {
        title: "Bảng dữ liệu",
        width: 180,
        render: (_, record) => {
          const link = getLink(record.entityName, record.entityId??null);
          return link ? (
            <>
            <div className="font-medium cursor-pointer hover:underline" onClick={() => {navigate(link)}}>{record.entityName}</div>
            <Text type="secondary" className="text-xs">
                ID: {record.entityId || "-"}
              </Text>
            </>
          ) : (
            <>
              <div className="font-medium">{record.entityName}</div>
              
            </>
          );
        },
      },
      {
        title: "Thao tác",
        dataIndex: "action",
        width: 130,
        render: (value: DatabaseAction) => (
          <Tag color={getActionColor(value)}>{getActionLabel(value)}</Tag>
        ),
      },
      {
        title: "Người thực hiện",
        width: 210,
        render: (_, record) => (
          <div>
            <div className="font-medium">{record.actorName || "SYSTEM"}</div>
            <Text type="secondary" className="text-xs">
              {record.employeeCode || record.actorUsername || "-"}
            </Text>
          </div>
        ),
      },
      {
        title: "Nội dung",
        dataIndex: "content",
        render: (_, record) => (
          <Tooltip placement="topLeft" title="Nhấn để xem chi tiết">
            <div
              className="line-clamp-2 cursor-pointer whitespace-normal"
              onClick={() => setSelectedLog(record)}
            >
              {renderChangeLog(record.content)}
            </div>
          </Tooltip>
        ),
      },
      {
        title: "IP",
        dataIndex: "ipAddress",
        width: 140,
        render: (value) => value || "-",
      },
      {
        title: "",
        width: 90,
        align: "right",
        fixed: "right",
        render: (_, record) => (
          <Button icon={<EyeOutlined />} onClick={() => setSelectedLog(record)}>
            Xem
          </Button>
        ),
      },
    ],
    [],
  );

  return (
    <div className="flex flex-col gap-5 p-4 md:p-6">
      <Card>
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <Title level={4} className="!mb-1 flex items-center gap-2">
              <FileSearchOutlined />
              Lịch sử thay đổi dữ liệu
            </Title>

            <Text type="secondary">
              Theo dõi thao tác tạo mới, cập nhật và xóa dữ liệu trong hệ thống.
            </Text>
          </div>

          <Button icon={<ReloadOutlined />} onClick={fetchLogs} loading={loading}>
            Làm mới
          </Button>
        </div>
      </Card>

      <Card>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <Input
            allowClear
            prefix={<SearchOutlined />}
            placeholder="Tìm bảng(ORDER,...), nội dung"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onPressEnter={() => {
              setPage(0);
              setDebouncedKeyword(keyword.trim());
            }}
          />

          <Select
            value={action}
            onChange={(value) => {
              setPage(0);
              setAction(value);
            }}
            options={[
              { label: "Tất cả thao tác", value: "ALL" },
              { label: "Tạo mới", value: "CREATE" },
              { label: "Cập nhật", value: "UPDATE" },
              { label: "Xóa", value: "DELETE" },
            ]}
          />

          <RangePicker
            className="w-full xl:col-span-2"
            format="DD/MM/YYYY"
            value={dateRange}
            onChange={(value) => {
              setPage(0);
              setDateRange(value as [dayjs.Dayjs, dayjs.Dayjs] | null);
            }}
          />
        </div>

        <Space className="mt-4">
          <Button type="primary" onClick={fetchLogs} loading={loading}>
            Lọc dữ liệu
          </Button>

          <Button onClick={resetFilter}>Xóa bộ lọc</Button>
        </Space>
      </Card>

      <Card>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={Array.isArray(logs) ? logs : []}
          loading={loading}
          pagination={{
            current: page + 1,
            pageSize: PAGE_SIZE,
            total: totalElements,
            showSizeChanger: false,
            showTotal: (total) => `Tổng ${total} lịch sử`,
            onChange: (nextPage) => setPage(nextPage - 1),
          }}
          locale={{
            emptyText: <Empty description="Không có lịch sử thay đổi dữ liệu" />,
          }}
        />
      </Card>

      <Drawer
        title="Chi tiết thay đổi dữ liệu"
        open={!!selectedLog}
        onClose={() => setSelectedLog(null)}
        width={760}
      >
        {selectedLog && (
          <div className="space-y-5">
            <Descriptions bordered className="!mb-5" size="small" column={1}>
              <Descriptions.Item label="Thời gian">
                {formatDateTimeDDMMYYYY_HHMMSS(selectedLog.createdAt)}
              </Descriptions.Item>

              <Descriptions.Item label="Bảng dữ liệu">
                {selectedLog.entityName}
              </Descriptions.Item>

              <Descriptions.Item label="Mã dữ liệu">
                {selectedLog.entityId || "-"}
              </Descriptions.Item>

              <Descriptions.Item label="Thao tác">
                <Tag color={getActionColor(selectedLog.action)}>
                  {getActionLabel(selectedLog.action)}
                </Tag>
              </Descriptions.Item>

              <Descriptions.Item label="Người thực hiện">
                {selectedLog.actorName || "SYSTEM"}
              </Descriptions.Item>

              <Descriptions.Item label="Mã nhân viên / Username">
                {selectedLog.employeeCode || selectedLog.actorUsername || "-"}
              </Descriptions.Item>

              <Descriptions.Item label="IP">
                {selectedLog.ipAddress || "-"}
              </Descriptions.Item>

              <Descriptions.Item label="User Agent">
                <span className="break-all">
                  {selectedLog.userAgent || "-"}
                </span>
              </Descriptions.Item>

              <Descriptions.Item label="Nội dung">
                <div style={{ whiteSpace: "pre-line" }}>
                  {renderChangeLog(selectedLog.content)}
                </div>
              </Descriptions.Item>
            </Descriptions>

            <JsonBlock title="Dữ liệu cũ" value={selectedLog.oldValue} />
            <JsonBlock title="Dữ liệu mới" value={selectedLog.newValue} />
          </div>
        )}
      </Drawer>
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
      <div className="mb-2 font-medium">{title}</div>
      <pre className="max-h-[420px] overflow-auto rounded-lg bg-slate-950 p-4 text-xs text-slate-100">
        {prettyJson(value)}
      </pre>
    </div>
  );
}