import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, UserPlus, PencilLine, Trash2, History } from "lucide-react";

const clients = [
  { id: 1, name: "Aarav Sharma", mobile: "+91 98765 43210", reportId: "QHR-1024", date: "15 Jul 2026", status: "Normal" },
  { id: 2, name: "Meera Gupta", mobile: "+91 91234 56789", reportId: "QHR-1023", date: "14 Jul 2026", status: "High" },
  { id: 3, name: "Rohan Iyer", mobile: "+91 99876 54321", reportId: "QHR-1022", date: "14 Jul 2026", status: "Low" },
];

export default function ClientManagement() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Client Management</h1>
          <p className="text-sm text-muted-foreground">Add, update, search and review client history with a single view.</p>
        </div>
        <Button className="gap-2">
          <UserPlus className="h-4 w-4" /> Add Client
        </Button>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Client Search</CardTitle>
          <CardDescription>Search by name, mobile number, report ID or date.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search clients, mobile, report ID, date" className="pl-9" />
            </div>
            <Button variant="outline">Quick Filter</Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Client Directory</CardTitle>
          <CardDescription>Prototype layout for managing client records and history.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {clients.map((client) => (
              <div key={client.id} className="flex flex-col gap-3 rounded-2xl border border-slate-200 p-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-semibold">{client.name}</p>
                  <p className="text-sm text-muted-foreground">{client.mobile}</p>
                  <p className="text-sm text-muted-foreground">Report: {client.reportId} • {client.date}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-3 py-1 text-sm font-medium ${client.status === "High" ? "bg-rose-100 text-rose-700" : client.status === "Low" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>
                    {client.status}
                  </span>
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
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
