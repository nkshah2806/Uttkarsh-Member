"use client"

import * as React from "react"
import { Calendar } from "@/components/ui/calendar"

export function CalendarBirth(props) {
  const [date, setDate] = React.useState(new Date())

  return (
    <Calendar
      mode="single"
      selected={date}
      onSelect={setDate}
      captionLayout="dropdown"
      fromYear={1900}
      toYear={new Date().getFullYear()}
      className="rounded-md border shadow-sm"
      {...props}
    />
  )
}
