import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileDown, Printer, QrCode, Sparkles } from "lucide-react";

const sections = [
  "Cover Page",
  "Health Score",
  "Body Organ Summary",
  "Charts",
  "Detailed Analysis",
  "Personalized Recommendations",
  "Disclaimer",
];

export default function ReportDesigner() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">PDF Report Design</h1>
          <p className="text-sm text-muted-foreground">Preview the professional report layout with branding, charts and QR code.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Printer className="h-4 w-4" /> Print
          </Button>
          <Button className="gap-2">
            <FileDown className="h-4 w-4" /> Export PDF
          </Button>
        </div>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Professional PDF Layout</CardTitle>
          <CardDescription>Auto-generated report structure designed for A4, color PDF and branding.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl border border-violet-200 bg-gradient-to-br from-white to-violet-50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-violet-600">UTKARSH Quantum Health</p>
                <h2 className="mt-2 text-2xl font-semibold">Client Health Report</h2>
              </div>
              <div className="rounded-2xl border border-violet-200 bg-white p-3">
                <QrCode className="h-8 w-8 text-violet-600" />
              </div>
            </div>
            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-sm text-muted-foreground">Health Score</p>
              <div className="mt-2 flex items-end gap-2">
                <span className="text-4xl font-semibold text-emerald-600">82</span>
                <span className="text-sm text-muted-foreground">/ 100</span>
              </div>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {sections.slice(0, 4).map((section) => (
                <div key={section} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700">
                  {section}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">PDF Components</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>• A4-size, color PDF output</p>
                <p>• Company logo and page numbers</p>
                <p>• QR code and client history summary</p>
                <p>• Charts and comparison graphs</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Next Action</CardTitle>
              </CardHeader>
              <CardContent>
                <Button className="w-full gap-2">
                  <Sparkles className="h-4 w-4" /> Preview Full Report
                </Button>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
