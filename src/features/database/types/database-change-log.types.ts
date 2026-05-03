export type DatabaseAction = "CREATE" | "UPDATE" | "DELETE";

export type DatabaseChangeLog = {
  id: number;
  entityName: string;
  entityId?: string | null;
  action: DatabaseAction;
  content: string;
  oldValue?: string | null;
  newValue?: string | null;
  actorUserId?: number | null;
  actorName?: string | null;
  actorUsername?: string | null;
  employeeCode?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: string;
};

export type DatabaseChangeLogPage = {
  content: DatabaseChangeLog[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
};