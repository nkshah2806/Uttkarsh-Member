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
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, AlertTriangle, CheckCircle2, CircleDollarSign } from "lucide-react";

const parameters = [
  { name: "Body Temperature", value: "98.6°F", status: "Normal" },
  { name: "Blood Pressure", value: "124/82", status: "High" },
  { name: "Hemoglobin", value: "12.8 g/dL", status: "Low" },
  { name: "Blood Sugar", value: "94 mg/dL", status: "Normal" },
];

export default function ReportEntry() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Quantum Report Entry</h1>
          <p className="text-sm text-muted-foreground">Capture 250–300 parameters with auto status, color coding and notes.</p>
        </div>
        <Button className="gap-2">
          <Sparkles className="h-4 w-4" /> Generate Report
        </Button>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Client & Report Details</CardTitle>
          <CardDescription>Core intake details for the health report workflow.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <Input placeholder="Client Name" />
          <Input placeholder="Report ID" />
          <Input placeholder="Consultant Name" />
          <Input placeholder="Date" />
          <Textarea className="md:col-span-2" placeholder="Clinical notes and observations" />
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Parameter Entry</CardTitle>
          <CardDescription>Prototype layout for master-driven entries and status tagging.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {parameters.map((parameter) => (
              <div key={parameter.name} className="rounded-2xl border border-slate-200 p-4">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{parameter.name}</p>
                  <span className={`rounded-full px-3 py-1 text-sm font-medium ${parameter.status === "High" ? "bg-rose-100 text-rose-700" : parameter.status === "Low" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>
                    {parameter.status}
                  </span>
                </div>
                <Input className="mt-3" value={parameter.value} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-emerald-600">
              <CheckCircle2 className="h-5 w-5" />
              <p className="font-semibold">Auto Status</p>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">Normal, Low and High flags based on the master parameter range.</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-amber-600">
              <AlertTriangle className="h-5 w-5" />
              <p className="font-semibold">Color Coding</p>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">Visual indicators for urgency and interpretation.</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-violet-600">
              <CircleDollarSign className="h-5 w-5" />
              <p className="font-semibold">Report Notes</p>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">Capture final guidance and consultant recommendations.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
