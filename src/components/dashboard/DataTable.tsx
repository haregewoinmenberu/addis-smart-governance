import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (row: T) => ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  isLoading?: boolean;
  emptyMessage?: string;
  emptyIcon?: ReactNode;
  pagination?: {
    currentPage: number;
    totalPages: number;
    pageSize: number;
    totalItems: number;
    onPageChange?: (page: number) => void;
    onPageSizeChange?: (size: number) => void;
  };
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  isLoading,
  emptyMessage = "No data available",
  emptyIcon,
  pagination,
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-muted/20 animate-pulse rounded" />
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-12">
        {emptyIcon && <div className="mb-4">{emptyIcon}</div>}
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Table */}
      <div className="border border-border/40 rounded-xl overflow-hidden bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#f8fafc]">
              <tr className="border-b border-border/40">
                {columns.map((column, index) => (
                  <th
                    key={index}
                    className={`text-left py-3.5 px-6 font-semibold text-[11px] text-[#718096] uppercase tracking-wider ${
                      column.className || ""
                    }`}
                  >
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className={`border-b border-border/40 hover:bg-slate-50/50 transition-colors ${
                    rowIndex % 2 === 0 ? "bg-white" : "bg-[#f8fafc]/30"
                  }`}
                >
                  {columns.map((column, colIndex) => (
                    <td key={colIndex} className={`py-4 px-6 text-sm text-[#4a5568] ${column.className || ""}`}>
                      {column.cell
                        ? column.cell(row)
                        : column.accessorKey
                          ? row[column.accessorKey]
                          : null}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">rows per page:</span>
            <Select
              value={pagination.pageSize.toString()}
              onValueChange={(value) =>
                pagination.onPageSizeChange?.(parseInt(value))
              }
            >
              <SelectTrigger className="w-[65px] h-8 text-xs border-border/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-muted-foreground">
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-3 text-xs border-border/60 hover:bg-slate-50"
                onClick={() => pagination.onPageChange?.(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
              >
                Prev
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-3 text-xs border-border/60 hover:bg-slate-50"
                onClick={() => pagination.onPageChange?.(pagination.currentPage + 1)}
                disabled={pagination.currentPage >= pagination.totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
