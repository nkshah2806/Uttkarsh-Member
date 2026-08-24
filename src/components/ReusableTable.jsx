import React, {
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
  SelectGroup,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import ReactPaginate from "react-paginate";
import { useQueryEffect } from "@/hooks/useQueryEffect";
import { useApiQuery } from "@/hooks/useApiQuery";
import {
  ArrowDownUp,
  ArrowDownWideNarrow,
  ArrowUpNarrowWide,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import DateRangeFilter from "./DateRangeFilter";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";
const defaultLimitOptions = [5, 10, 25, 50, 100];

const ReusableTable = forwardRef(
  (
    {
      headers = [],
      data: clientData = null,
      loading: externalLoading = false,
      apiPagination = false,
      fetchData = () => { },
      defaultLimit = 10,
      limitOptions = defaultLimitOptions,
      selectable = false,
      onSelectionChange = () => { },
      customCellRender = {},
      CreateExportRender,
      DateRange,
      routeType = "default",
      BookingStatus,
      Search = false,
      rowClassName = () => "",
      statusFilter = false,
      viewAll = false,
      pagination = true,
      onRowClick = null,
    },
    ref
  ) => {
    const [limit, setLimit] = useState(defaultLimit);
    const [isActive, setIsActive] = useState();
    const [status, setStatus] = useState();
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [sort, setSort] = useState({ key: null, direction: null });
    const [selectedRows, setSelectedRows] = useState([]);
    const [localData, setLocalData] = useState([]);
    const [total, setTotal] = useState(0);
    const [dateRange, setDateRange] = useState([null, null]);
    const [startDate, endDate] = dateRange;
    const navigate = useNavigate();

    useEffect(() => {
      return () => {
        setLocalData([]);
        setSelectedRows([]);
      };
    }, []);

    useEffect(() => {
      if (apiPagination) {
        setLocalData([]);
        setSelectedRows([]);
        setPage(1);
      }
    }, [fetchData, apiPagination]);

    const { data: apiData, isLoading: apiLoading, isError, error, refetch } = useApiQuery({
      queryKey: [
        "table-data",
        routeType,
        { page, limit, isActive, search, sort, startDate, endDate, status },
      ],
      queryFn: () =>
        fetchData({
          page,
          limit,
          isActive,
          search,
          sort,
          startDate,
          endDate,
          status,
        }),
      enabled: apiPagination,
      refetchOnMount: true,
    });

    useQueryEffect({
      data: apiData,
      isError,
      error,
      onSuccess: (resData) => {
        setLocalData(resData.data || []);
        setTotal(resData.total || 0);
      },
      onError: (err) => {
        const msg =
          err?.response?.data?.meta?.message ||
          err?.response?.data?.message ||
          err?.message ||
          "Something went wrong";
        toast.error(msg);
      },
    });

    useImperativeHandle(ref, () => ({
      refetchTable: () => {
        if (apiPagination) refetch();
      },
    }));

    useEffect(() => {
      if (!apiPagination && clientData) {
        let filtered = Array.isArray(clientData) ? [...clientData] : [];
        if (search) {
          const q = search.toLowerCase();
          filtered = filtered.filter((item) =>
            Object.values(item).some((val) =>
              val !== null && val !== undefined && String(val).toLowerCase().includes(q)
            )
          );
        }
        if (sort.key) {
          filtered.sort((a, b) => {
            const aVal = a[sort.key] ?? "";
            const bVal = b[sort.key] ?? "";
            if (aVal === bVal) return 0;
            return sort.direction === "asc"
              ? aVal > bVal
                ? 1
                : -1
              : aVal < bVal
                ? 1
                : -1;
          });
        }
        setTotal(filtered.length);
        if (pagination) {
          const start = (page - 1) * limit;
          setLocalData(filtered.slice(start, start + limit));
        } else {
          setLocalData(filtered);
        }
      }
    }, [apiPagination, clientData, page, limit, search, sort, isActive, status, pagination]);

    const totalPages = Math.ceil(total / limit) || 1;
    const isLoading = apiPagination ? apiLoading : externalLoading;

    const handleSearchChange = (e) => {
      setSearch(e.target.value);
      setPage(1);
    };

    const handleLimitChange = (value) => {
      setLimit(Number(value));
      setPage(1);
    };

    const handleIsActive = (value) => {
      setIsActive(
        value === "true" ? true : value === "false" ? false : undefined
      );
      setPage(1);
    };

    const handleStatus = (value) => {
      setStatus(value);
      setPage(1);
    };

    const handlePageChange = ({ selected }) => {
      setPage(selected + 1);
    };

    const toggleSelectRow = (row) => {
      const rowId = row._id || row.id;
      let updated = selectedRows.some((r) => (r._id || r.id) === rowId)
        ? selectedRows.filter((r) => (r._id || r.id) !== rowId)
        : [...selectedRows, row];
      setSelectedRows(updated);
      onSelectionChange(updated);
    };

    const toggleSelectAll = () => {
      if (selectedRows.length === localData.length) {
        setSelectedRows([]);
        onSelectionChange([]);
      } else {
        setSelectedRows(localData);
        onSelectionChange(localData);
      }
    };

    const handleSort = (key) => {
      setSort((prev) => {
        if (prev.key !== key) return { key, direction: "asc" };
        if (prev.direction === "asc") return { key, direction: "desc" };
        return { key: null, direction: null };
      });
      setPage(1);
    };

    const getSortIcon = (key) => {
      if (sort.key !== key)
        return <ArrowDownUp className="ml-1 size-4 text-gray-500 shrink-0" />;
      return sort.direction === "asc" ? (
        <ArrowUpNarrowWide className="ml-1 size-4 shrink-0 text-indigo-600" />
      ) : (
        <ArrowDownWideNarrow className="ml-1 size-4 shrink-0 text-indigo-600" />
      );
    };

    const formatDate = (date) => {
      if (!date) return null;
      const year = date.getFullYear();
      const month = `${date.getMonth() + 1}`.padStart(2, "0");
      const day = `${date.getDate()}`.padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    const handleClearFilters = () => {
      setSearch("");
      setStatus();
      setIsActive(undefined);
      setDateRange([null, null]);
      setPage(1);
    };

    const searchPlaceholder = typeof Search === "string" ? Search : "Search...";

    return (
      <>
        {(Search || CreateExportRender || DateRange || statusFilter || BookingStatus) && (
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto flex-1">
              {Search && (
                <Input
                  placeholder={searchPlaceholder}
                  value={search}
                  onChange={handleSearchChange}
                  className="w-full md:w-72"
                />
              )}
              {DateRange && (
                <DateRangeFilter
                  value={dateRange}
                  onDateRangeChange={(range) => {
                    setDateRange([
                      range[0] ? formatDate(range[0]) : null,
                      range[1] ? formatDate(range[1]) : null,
                    ]);
                    setPage(1);
                  }}
                />
              )}
              {statusFilter && (
                <Select
                  onValueChange={handleIsActive}
                  value={isActive === undefined ? "" : String(isActive)}
                >
                  <SelectTrigger className="max-w-max">
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem key="active" value="true">
                      Active
                    </SelectItem>
                    <SelectItem key="inactive" value="false">
                      Inactive
                    </SelectItem>
                  </SelectContent>
                </Select>
              )}
              {BookingStatus && (
                <Select
                  onValueChange={handleStatus}
                  value={status === undefined ? "" : status}
                >
                  <SelectTrigger className="max-w-max">
                    <SelectValue placeholder="Select Booking Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem key="confirmed" value="confirmed">
                      Confirmed
                    </SelectItem>
                    <SelectItem key="completed" value="completed">
                      Completed
                    </SelectItem>
                    <SelectItem key="booked" value="booked">
                      Booked
                    </SelectItem>
                    <SelectItem key="cancelled" value="cancelled">
                      Cancelled
                    </SelectItem>
                    <SelectItem key="request for refund" value="request for refund">
                      Request for Refund
                    </SelectItem>
                    <SelectItem key="refunded" value="refunded">
                      Refunded
                    </SelectItem>
                  </SelectContent>
                </Select>
              )}
              {(search || status || isActive !== undefined || dateRange[0]) && (
                <Button variant="outline" size="sm" onClick={handleClearFilters}>
                  Clear Filters
                </Button>
              )}
            </div>

            {CreateExportRender && (
              <div className="flex items-center gap-2 shrink-0">
                {typeof CreateExportRender === "function" ? (
                  <CreateExportRender />
                ) : (
                  CreateExportRender
                )}
              </div>
            )}
            {viewAll && (
              <Button className="ms-auto" variant="outline" onClick={() => navigate('/booking')}>
                View All
              </Button>
            )}
          </div>
        )}

        {selectedRows.length > 0 && (
          <div className="mb-4 text-sm font-medium">
            {selectedRows.length} row(s) selected
          </div>
        )}

        <div className="w-full rounded-lg border">
          {isLoading ? (
            <div className="flex justify-center items-center h-48">
              <Loader2 className="animate-spin size-10 text-indigo-600" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  {selectable && (
                    <TableHead className="w-12">
                      <Checkbox
                        checked={localData.length > 0 && selectedRows.length === localData.length}
                        onCheckedChange={toggleSelectAll}
                      />
                    </TableHead>
                  )}
                  {headers.map((header) => (
                    <TableHead
                      key={header.key}
                      onClick={() => {
                        if (header.filterable !== false) handleSort(header.key);
                      }}
                      className={header.filterable !== false ? "cursor-pointer select-none" : ""}
                    >
                      <div className="flex items-center gap-2">
                        <span>{header.label}</span>
                        {header.filterable !== false && getSortIcon(header.key)}
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {localData.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={headers.length + (selectable ? 1 : 0)}
                      className="text-center py-8 text-gray-400"
                    >
                      No data found
                    </TableCell>
                  </TableRow>
                ) : (
                  localData.map((row, idx) => {
                    const rowId = row._id || row.id || idx;
                    return (
                      <TableRow
                        key={rowId}
                        className={`${rowClassName(row)} ${onRowClick ? "cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50" : ""}`}
                        onClick={(e) => onRowClick && onRowClick(row, e)}
                      >
                        {selectable && (
                          <TableCell>
                            <Checkbox
                              checked={selectedRows.some((r) => (r._id || r.id) === rowId)}
                              onCheckedChange={() => toggleSelectRow(row)}
                            />
                          </TableCell>
                        )}
                        {headers.map((header) => (
                          <TableCell key={header.key}>
                            {header.render
                              ? header.render(row)
                              : customCellRender[header.key]
                                ? customCellRender[header.key](row[header.key], row)
                                : row[header.key] ?? "—"}
                          </TableCell>
                        ))}
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          )}
        </div>

        {pagination && total > 0 && (
          <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between mt-4">
            <div className="flex items-center gap-2">
              <label htmlFor="pageSize" className="text-sm flex-none text-muted-foreground">
                Rows per page:
              </label>
              <Select onValueChange={handleLimitChange} value={String(limit)}>
                <SelectTrigger className="w-[80px]">
                  <SelectValue placeholder="Size" />
                </SelectTrigger>
                <SelectContent>
                  {limitOptions.map((opt) => (
                    <SelectItem key={opt} value={String(opt)}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <ReactPaginate
              pageCount={totalPages}
              pageRangeDisplayed={2}
              marginPagesDisplayed={1}
              onPageChange={handlePageChange}
              forcePage={Math.max(0, page - 1)}
              containerClassName="flex items-center gap-2 flex-wrap"
              pageClassName="border rounded-md cursor-pointer"
              activeClassName="active bg-primary dark:bg-gray-800 border-primary dark:border-gray-800 text-white font-bold"
              pageLinkClassName="px-3 py-1 bg-transparent text-sm inline-block"
              previousLabel="Prev"
              nextLabel="Next"
              breakLabel="..."
              previousLinkClassName="px-3 py-1 bg-transparent text-sm inline-block"
              nextLinkClassName="px-3 py-1 bg-transparent text-sm inline-block"
              disabledClassName="opacity-50 !cursor-not-allowed"
              nextClassName="border rounded-md cursor-pointer"
              previousClassName="border rounded-md cursor-pointer"
            />
          </div>
        )}
      </>
    );
  }
);

export default ReusableTable;
