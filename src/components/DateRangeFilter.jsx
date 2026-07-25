// components/DateRangeFilter.jsx or .tsx
import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

const DateRangeFilter = ({
  onDateRangeChange,
  defaultTodayDate = false,
  value,
}) => {
  const today = new Date();
  const defaultFrom = new Date(today.getFullYear(), today.getMonth(), 1);
  const defaultTo = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  const [dateRange, setDateRange] = React.useState(
    defaultTodayDate
      ? { from: defaultFrom, to: defaultTo }
      : value
      ? { from: new Date(value[0]), to: new Date(value[1]) }
      : { from: null, to: null }
  );
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    if (defaultTodayDate && onDateRangeChange) {
      onDateRangeChange([defaultFrom, defaultTo]);
    }
  }, [defaultTodayDate]);
  React.useEffect(() => {
    if (value) {
      setDateRange({
        from: value[0] ? new Date(value[0]) : null,
        to: value[1] ? new Date(value[1]) : null,
      });
    }
  }, [value]);

  const handleSelect = (range) => {
    if (!range) return; // Prevent error if range is undefined
    setDateRange(range);
    if (onDateRangeChange) {
      onDateRangeChange([range.from, range.to]);
    }
    if (range.from && range.to) {
      setOpen(false); // Close popover when both dates are selected
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-[260px] justify-start text-left font-normal md:text-sm",
            !dateRange.from && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {dateRange && dateRange.from ? (
            dateRange.to ? (
              <>
                {format(dateRange.from, "LLL dd, y")} -{" "}
                {format(dateRange.to, "LLL dd, y")}
              </>
            ) : (
              format(dateRange.from, "LLL dd, y")
            )
          ) : (
            <span>Select date range</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          initialFocus
          mode="range"
          selected={dateRange}
          onSelect={handleSelect}
          numberOfMonths={2}
        />
      </PopoverContent>
    </Popover>
  );
};

export default DateRangeFilter;
