import React from "react";
import { useTranslation } from "react-i18next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileDown, Printer, QrCode, Sparkles } from "lucide-react";

export default function ReportDesigner() {
  const { t } = useTranslation();

  const sections = [
    { key: "coverPage", label: t("demo.reportDesigner.sections.coverPage") },
    { key: "healthScore", label: t("demo.reportDesigner.sections.healthScore") },
    { key: "bodyOrganSummary", label: t("demo.reportDesigner.sections.bodyOrganSummary") },
    { key: "charts", label: t("demo.reportDesigner.sections.charts") },
    { key: "detailedAnalysis", label: t("demo.reportDesigner.sections.detailedAnalysis") },
    { key: "personalizedRecommendations", label: t("demo.reportDesigner.sections.personalizedRecommendations") },
    { key: "disclaimer", label: t("demo.reportDesigner.sections.disclaimer") },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{t("demo.reportDesigner.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("demo.reportDesigner.subtitle")}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Printer className="h-4 w-4" /> {t("demo.reportDesigner.print")}
          </Button>
          <Button className="gap-2">
            <FileDown className="h-4 w-4" /> {t("demo.reportDesigner.exportPdf")}
          </Button>
        </div>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>{t("demo.reportDesigner.layoutTitle")}</CardTitle>
          <CardDescription>{t("demo.reportDesigner.layoutDesc")}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl border border-teal-200 bg-gradient-to-br from-white to-teal-50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-teal-600">{t("demo.reportDesigner.brandLine")}</p>
                <h2 className="mt-2 text-2xl font-semibold">{t("demo.reportDesigner.reportTitle")}</h2>
              </div>
              <div className="rounded-2xl border border-teal-200 bg-white p-3">
                <QrCode className="h-8 w-8 text-teal-600" />
              </div>
            </div>
            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-sm text-muted-foreground">{t("demo.reportDesigner.healthScore")}</p>
              <div className="mt-2 flex items-end gap-2">
                <span className="text-4xl font-semibold text-emerald-600">82</span>
                <span className="text-sm text-muted-foreground">{t("demo.reportDesigner.outOf100")}</span>
              </div>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {sections.slice(0, 4).map((section) => (
                <div key={section.key} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700">
                  {section.label}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">{t("demo.reportDesigner.componentsTitle")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>{t("demo.reportDesigner.component1")}</p>
                <p>{t("demo.reportDesigner.component2")}</p>
                <p>{t("demo.reportDesigner.component3")}</p>
                <p>{t("demo.reportDesigner.component4")}</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">{t("demo.reportDesigner.nextActionTitle")}</CardTitle>
              </CardHeader>
              <CardContent>
                <Button className="w-full gap-2">
                  <Sparkles className="h-4 w-4" /> {t("demo.reportDesigner.previewFullReport")}
                </Button>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
