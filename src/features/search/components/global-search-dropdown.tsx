import { Empty, Spin } from "antd";
import {
  FileText,
  Package,
  Receipt,
  Search,
  Users,
} from "lucide-react";
import { useMemo } from "react";
import { highlightText } from "../utils/highlight";
import { SearchEntityType, SearchSuggestion } from "@/types/search";

type Props = {
  keyword: string;
  loading: boolean;
  open: boolean;
  results: SearchSuggestion[];
  onSelect: (item: SearchSuggestion) => void;
};

function getEntityIcon(entityType: SearchEntityType) {
  switch (entityType) {
    case "ORDER":
      return <Receipt className="h-4 w-4 text-blue-500" />;

    case "PRODUCT":
      return <Package className="h-4 w-4 text-emerald-500" />;

    case "CUSTOMER":
      return <Users className="h-4 w-4 text-violet-500" />;

    case "PURCHASE_RECEIPT":
      return <FileText className="h-4 w-4 text-amber-500" />;

    default:
      return <Search className="h-4 w-4 text-slate-500" />;
  }
}

export function GlobalSearchDropdown({
  keyword,
  loading,
  open,
  results,
  onSelect,
}: Props) {
  const groupedResults = useMemo(() => {
    return results.reduce<Record<string, SearchSuggestion[]>>((acc, item) => {
      const key = item.entityLabel || item.entityType;

      if (!acc[key]) {
        acc[key] = [];
      }

      acc[key].push(item);
      return acc;
    }, {});
  }, [results]);

  if (!open || !keyword.trim()) return null;

  return (
    <div className="absolute top-[calc(100%+8px)] z-50 max-h-[420px] w-full overflow-auto rounded-2xl border bg-white p-2 shadow-xl">
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Spin size="small" />
        </div>
      ) : null}

      {!loading && results.length === 0 ? (
        <div className="rounded-xl px-3 py-6">
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={`Không tìm thấy "${keyword}"`}
          />
        </div>
      ) : null}

      {!loading &&
        Object.entries(groupedResults).map(([groupName, items]) => (
          <div key={groupName} className="mb-2 last:mb-0">
            <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {groupName}
            </div>

            <div className="space-y-1">
              {items.map((item) => (
                <button
                  key={`${item.entityType}-${item.entityId}`}
                  type="button"
                  onClick={() => onSelect(item)}
                  className="flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-slate-50"
                >
                  <div className="mt-0.5 shrink-0 rounded-lg bg-slate-100 p-2">
                    {getEntityIcon(item.entityType)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate font-medium text-slate-900">
                        {highlightText(item.title, keyword)}
                      </p>

                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600">
                        {item.entityLabel}
                      </span>
                    </div>

                    {item.subtitle ? (
                      <p className="mt-1 truncate text-sm text-slate-600">
                        {highlightText(item.subtitle, keyword)}
                      </p>
                    ) : null}

                    {item.meta ? (
                      <p className="mt-1 truncate text-xs text-slate-500">
                        {highlightText(item.meta, keyword)}
                      </p>
                    ) : null}
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
    </div>
  );
}