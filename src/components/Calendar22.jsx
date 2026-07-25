"use client";

import * as React from "react";
import { CalendarIcon, ChevronDownIcon } from "lucide-react";
import { CalendarBirth } from "./ui/calendar-birth";
import { Calendar } from "./ui/calendar";
import { Label } from "./ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Button } from "./ui/button";
import { format } from "date-fns";

export function Calendar22({ value, onValueChange, placeholder }) {
  const [open, setOpen] = React.useState(false);
  const [date, setDate] = React.useState(undefined);
  // Sync internal state with prop
  React.useEffect(() => {
    setDate(value);
  }, [value]);
  // Handle date selection and notify parent
  const handleSelect = (selectedDate) => {
    setDate(selectedDate);
    if (onValueChange) onValueChange(selectedDate);
  };
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="font-normal justify-start">
          <CalendarIcon className="text-muted-foreground " />
          {date ? format(date, "PPP") : <span className="text-muted-foreground text-[14px]">{placeholder || "Pick a date"}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto overflow-hidden p-0" align="start">
        <CalendarBirth mode="single" selected={date} onSelect={handleSelect} />
      </PopoverContent>
    </Popover>
  );
}
