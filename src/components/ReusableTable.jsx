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
      apiPagination = false,
      fetchData = () => { },
      defaultLimit = 10,
      // defaultIsActive = true,
      limitOptions = defaultLimitOptions,
      selectable = false,
      onSelectionChange = () => { },
      customCellRender = {},
      CreateExportRender,
      DateRange,
      routeType = "default",
      BookingStatus,
      Search,
      rowClassName = () => "",
      statusFilter = true,
      viewAll = false,
      pagination = true
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
      setLocalData([]);
      setSelectedRows([]);
      setPage(1);
    }, [fetchData]);

    const { data, isLoading, isError, error, refetch } = useApiQuery({
      queryKey: [
        "table-data",
        routeType, // unique part for different pages
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
      data,
      isError,
      error,
      onSuccess: (data) => {
        // debugger

        setLocalData(data.data);
        setTotal(data.total);
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
        refetch();
      },
    }));

    useEffect(() => {
      if (!apiPagination) {
        let filtered = [...data];
        if (search) {
          filtered = filtered.filter((item) =>
            Object.values(item).some((val) =>
              String(val).toLowerCase().includes(search.toLowerCase())
            )
          );
        }
        if (sort.key) {
          filtered.sort((a, b) => {
            const aVal = a[sort.key];
            const bVal = b[sort.key];
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
        const start = (page - 1) * limit;
        const paginated = filtered.slice(start, start + limit);
        setLocalData(paginated);
      }
    }, [data, page, limit, search, sort, isActive, status]);

    const totalPages = Math.ceil(total / limit);

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
      let updated = selectedRows.some((r) => r.id === row.id)
        ? selectedRows.filter((r) => r.id !== row.id)
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
        return <ArrowDownUp className="ml-1 size-4 text-gray-500" />;
      return sort.direction === "asc" ? (
        <ArrowUpNarrowWide className="ml-1 size-4" />
      ) : (
        <ArrowDownWideNarrow className="ml-1 size-4" />
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
      // refetch();
    };

    return (
      <>
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
          {Search && (
            <Input
              placeholder="Search..."
              value={search}
              onChange={handleSearchChange}
              className="w-full md:w-1/4"
            />
          )}
          {CreateExportRender && (
            <div className="flex items-center gap-2">
              <CreateExportRender />
            </div>
          )}
        </div>
        <div className="mb-4 flex items-center gap-4">
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
          {/* {console.log("isActive", isActive)} */}
          {statusFilter &&
            <Select
              onValueChange={handleIsActive}
              value={isActive === undefined ? "" : String(isActive)}
            >
              <SelectTrigger className="max-w-max">
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem key={true} value={"true"}>
                  Active
                </SelectItem>
                <SelectItem key={false} value={"false"}>
                  Inactive
                </SelectItem>
              </SelectContent>
            </Select>
          }
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
          {(search ||
            status ||
            isActive !== undefined ||
            (dateRange[0])) && (
              <Button
                onClick={() => {
                  handleClearFilters();
                }}
              >
                Clear Filters
              </Button>
            )}
          {viewAll && (
            <Button className="ms-auto" variant="outline" onClick={() => navigate('/booking')}>View All</Button>
          )}
        </div>
        {selectedRows.length > 0 && (
          <div className="mb-4 text-sm font-medium">
            {selectedRows.length} row(s) selected
          </div>
        )}
        <div className="w-full rounded-lg border">
          {isLoading ? (
            <div className="flex justify-center items-center h-48">
              <Loader2 className="animate-spin size-10" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  {selectable && (
                    <TableHead>
                      <Checkbox
                        checked={selectedRows.length === localData.length}
                        onCheckedChange={toggleSelectAll}
                      />
                    </TableHead>
                  )}
                  {headers.map((header) => (
                    <TableHead
                      key={header.key}
                      onClick={() => {
                        if (header.filterable) handleSort(header.key);
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <span>{header.label}</span>
                        {header.filterable && getSortIcon(header.key)}
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
                      className="text-center py-6 text-gray-400"
                    >
                      No data found
                    </TableCell>
                  </TableRow>
                ) : (
                  localData.map((row, idx) => (
                    <TableRow key={row.id || idx} className={rowClassName(row)}>
                      {selectable && (
                        <TableCell>
                          <Checkbox
                            checked={selectedRows.some((r) => r.id === row.id)}
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
                              : row[header.key]}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </div>

        {pagination && (<div className="flex flex-col md:flex-row md:items-center gap-4 justify-between mt-4">
          <div className="flex items-center gap-2">
            <label htmlFor="pageSize" className="text-sm flex-none">
              Rows per page :
            </label>
            <Select onValueChange={handleLimitChange} value={String(limit)}>
              <SelectTrigger className="w-[80px]">
                <SelectValue placeholder="Select Size" />
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
            forcePage={page - 1}
            containerClassName="flex items-center gap-2 flex-wrap"
            pageClassName="border rounded-md cursor-pointer"
            activeClassName="active bg-primary dark:bg-gray-800 border-primary dark:border-gray-800 text-white"
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
        </div>)}
      </>
    );
  }
);

export default ReusableTable;
