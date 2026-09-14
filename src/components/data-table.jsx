import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "./ui/button";
import { Eye, PencilRuler, Trash2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

export function DataTable({
  columns,
  data,
  handleEdit,
  handleDelete,
  handleView,
}) {
  const { t } = useTranslation();
  const [globalFilter, setGlobalFilter] = useState("");
  const [rowSelection, setRowSelection] = useState({});
  const [sorting, setSorting] = useState([]);

  const enhancedColumns = [
    {
      id: "select",
      header: ({ table }) => (
        <input
          type="checkbox"
          checked={table.getIsAllPageRowsSelected()}
          onChange={table.getToggleAllPageRowsSelectedHandler()}
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={row.getIsSelected()}
          disabled={!row.getCanSelect()}
          onChange={row.getToggleSelectedHandler()}
        />
      ),
    },
    ...columns,
    {
      id: "actions",
      header: t("demo.table.actions"),
      cell: ({ row }) => {
        const rowData = row.original;
        const { action = {} } = rowData;

        return (
          <div className="flex items-center gap-2 w-max">
            {action.view && (
              <Button variant="outline" onClick={() => handleView(rowData)}>
                <Eye className="size-5" strokeWidth={1.5} />
              </Button>
            )}
            {action.edit && (
              <Button variant="outline" onClick={() => handleEdit(rowData)}>
                <PencilRuler className="size-5" strokeWidth={1.5} />
              </Button>
            )}
            {action.delete && (
              <Button variant="outline" onClick={() => handleDelete(rowData)}>
                <Trash2 className="size-5" strokeWidth={1.5} />
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data,
    columns: enhancedColumns,
    state: {
      globalFilter,
      rowSelection,
      sorting,
    },
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    enableRowSelection: true,
  });

  return (
    <div className="space-y-4">
      <input
        type="text"
        value={globalFilter}
        onChange={(e) => setGlobalFilter(e.target.value)}
        placeholder={t("demo.table.searchPlaceholder")}
        className="border px-3 py-2 rounded-md w-full md:w-1/3"
      />

      <div className="rounded-md border overflow-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    className={
                      header.column.getCanSort()
                        ? "cursor-pointer select-none"
                        : ""
                    }
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                    {header.column.getCanSort()
                      ? {
                        asc: " ↑",
                        desc: " ↓",
                      }[header.column.getIsSorted()] ?? " ↕"
                      : null}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className="cursor-pointer">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={enhancedColumns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <span>{t("demo.table.noResults")}</span>
                    <span className="text-xs">
                      {t("demo.table.tryAdjusting")}
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex items-center gap-2">
          <label htmlFor="pageSize" className="text-sm flex-none">
            {t("demo.table.rowsPerPage")}
          </label>
          <Select
            onValueChange={(value) => table.setPageSize(Number(value))}
            value={String(table.getState().pagination.pageSize)}
          >
            <SelectTrigger>
              <SelectValue placeholder={t("demo.table.selectSize")} />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {[5, 10, 20, 50, 100].map((size) => (
                  <SelectItem value={String(size)} key={size}>
                    {size}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div className="text-sm text-muted-foreground inline-flex items-center gap-1">
          <span>{t("demo.table.page")}</span>
          <span className="font-medium">{table.getState().pagination.pageIndex + 1}</span>
          <span>{t("demo.table.of")}</span>
          <span className="font-medium">{table.getPageCount()}</span>
        </div>

        <div className="text-sm text-muted-foreground inline-flex items-center gap-1">
          <span>{t("demo.table.showing")}</span>
          <span className="font-medium">{table.getRowModel().rows.length}</span>
          <span>{t("demo.table.of")}</span>
          <span className="font-medium">{table.getFilteredRowModel().rows.length}</span>
          <span>{t("demo.table.entries")}</span>
        </div>

        <div className="ms-auto space-x-2">
          <Button
            className="px-3 py-2 text-sm border"
            variant={!table.getCanPreviousPage() ? "secondary" : "default"}
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            {t("demo.table.prev")}
          </Button>
          <Button
            className="px-3 py-2 text-sm border"
            variant={!table.getCanNextPage() ? "secondary" : "default"}
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            {t("demo.table.next")}
          </Button>
        </div>
      </div>
    </div>
  );
}
