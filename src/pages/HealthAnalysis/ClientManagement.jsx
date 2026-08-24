import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserPlus, PencilLine, Trash2, History } from "lucide-react";
import ReusableTable from "@/components/ReusableTable";

const clients = [
  { id: 1, name: "Aarav Sharma", mobile: "+91 98765 43210", reportId: "QHR-1024", date: "15 Jul 2026", status: "Normal" },
  { id: 2, name: "Meera Gupta", mobile: "+91 91234 56789", reportId: "QHR-1023", date: "14 Jul 2026", status: "High" },
  { id: 3, name: "Rohan Iyer", mobile: "+91 99876 54321", reportId: "QHR-1022", date: "14 Jul 2026", status: "Low" },
];

const statusColors = {
  High: "bg-rose-100 text-rose-700",
  Low: "bg-amber-100 text-amber-700",
  Normal: "bg-emerald-100 text-emerald-700",
};

const headers = [
  {
    key: "name",
    label: "Client Name",
    render: (row) => <span className="font-semibold">{row.name}</span>,
  },
  { key: "mobile", label: "Mobile" },
  { key: "reportId", label: "Report ID" },
  { key: "date", label: "Date" },
  {
    key: "status",
    label: "Status",
    render: (row) => (
      <span
        className={`rounded-full px-3 py-1 text-xs font-semibold ${
          statusColors[row.status] || "bg-slate-100 text-slate-700"
        }`}
      >
        {row.status}
      </span>
    ),
  },
  {
    key: "actions",
    label: "Actions",
    filterable: false,
    render: () => (
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon">
          <History className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon">
          <PencilLine className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    ),
  },
];

const AddClientButton = () => (
  <Button className="gap-2">
    <UserPlus className="h-4 w-4" /> Add Client
  </Button>
);

export default function ClientManagement() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Client Management</h1>
        <p className="text-sm text-muted-foreground">
          Add, update, search and review client history with a single view.
        </p>
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <ReusableTable
            headers={headers}
            data={clients}
            Search="Search clients, mobile, report ID, date..."
            CreateExportRender={AddClientButton}
            pagination={true}
          />
        </CardContent>
      </Card>
    </div>
  );
}
