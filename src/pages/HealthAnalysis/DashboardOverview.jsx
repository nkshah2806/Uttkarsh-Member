import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Activity,
  ArrowRight,
  FileText,
  HeartPulse,
  Users,
  Wallet,
} from "lucide-react";

const stats = [
  { title: "Total Clients", value: "1,240", icon: Users, accent: "from-emerald-500 to-green-500" },
  { title: "Today's Reports", value: "38", icon: FileText, accent: "from-sky-500 to-cyan-500" },
  { title: "Pending Reports", value: "17", icon: Activity, accent: "from-amber-500 to-orange-500" },
  { title: "Revenue", value: "₹8.4L", icon: Wallet, accent: "from-violet-500 to-fuchsia-500" },
];

const recentReports = [
  { id: "QHR-1024", client: "Aarav Sharma", status: "Normal", date: "15 Jul 2026" },
  { id: "QHR-1023", client: "Meera Gupta", status: "High", date: "14 Jul 2026" },
  { id: "QHR-1022", client: "Rohan Iyer", status: "Low", date: "14 Jul 2026" },
];

export default function DashboardOverview() {
  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-violet-200 bg-gradient-to-br from-violet-600 via-fuchsia-600 to-sky-600 p-6 text-white shadow-lg">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-violet-100">UTKARSH Quantum Health Analysis Software</p>
            <h1 className="mt-2 text-3xl font-semibold">Professional health analytics workspace for future-ready report generation</h1>
            <p className="mt-3 max-w-2xl text-sm text-violet-50">
              Designed for admin and consultant roles with master-driven parameters, auto status logic, and professional PDF output.
            </p>
          </div>
          <div className="rounded-2xl border border-white/30 bg-white/10 px-4 py-3 backdrop-blur">
            <p className="text-xs uppercase tracking-[0.3em] text-violet-100">Recommended workflow</p>
            <p className="mt-1 font-semibold">Dashboard → Client Entry → Report Entry → PDF Preview</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.title} className="border-0 shadow-sm">
              <CardContent className="p-5">
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${item.accent} text-white`}>
                  <Icon className="h-6 w-6" />
                </div>
                <p className="mt-4 text-sm text-muted-foreground">{item.title}</p>
                <p className="mt-1 text-3xl font-semibold">{item.value}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl">Recent Reports</CardTitle>
            <CardDescription>Latest quantum reports generated for clients.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentReports.map((report) => (
                <div key={report.id} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <div>
                    <p className="font-medium">{report.client}</p>
                    <p className="text-sm text-muted-foreground">{report.id} • {report.date}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`rounded-full px-3 py-1 text-sm font-medium ${report.status === "High" ? "bg-rose-100 text-rose-700" : report.status === "Low" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>
                      {report.status}
                    </span>
                    <Button variant="ghost" size="icon">
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl">Implementation Blueprint</CardTitle>
            <CardDescription>Core instructions for the engineering team.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl border border-violet-100 bg-violet-50 p-4">
              <div className="flex items-center gap-2 text-violet-700">
                <HeartPulse className="h-5 w-5" />
                <p className="font-semibold">Scalable parameter architecture</p>
              </div>
              <p className="mt-2 text-sm text-violet-700">
                The system should support 300+ parameters seamlessly, with all parameter definitions controlled through a master database.
              </p>
            </div>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>• Auto-generated professional PDF with logo, charts, color coding, QR code and client history.</p>
              <p>• Admin and consultant roles with secure workflows and role-based access.</p>
              <p>• Future-ready modules for Android app, WhatsApp report, email report and cloud backup.</p>
            </div>
            <Button className="w-full">Open Report Designer</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
