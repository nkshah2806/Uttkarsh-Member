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
import { useLanguage } from "@/context/LanguageContext";

const sections = [
  { key: "coverPage", label: "Cover Page" },
  { key: "healthScore", label: "Health Score" },
  { key: "bodyOrganSummary", label: "Body Organ Summary" },
  { key: "charts", label: "Charts" },
  { key: "detailedAnalysis", label: "Detailed Analysis" },
  { key: "personalizedRecommendations", label: "Personalized Recommendations" },
  { key: "disclaimer", label: "Disclaimer" },
];

export default function ReportDesigner() {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{t("reportDesignerTitle")}</h1>
          <p className="text-sm text-muted-foreground">{t("reportDesignerDescription")}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Printer className="h-4 w-4" /> {t("printView")}
          </Button>
          <Button className="gap-2">
            <FileDown className="h-4 w-4" /> {t("exportPdf")}
          </Button>
        </div>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>{t("professionalPdfLayout")}</CardTitle>
          <CardDescription>{t("professionalPdfLayoutDesc")}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl border border-violet-200 bg-gradient-to-br from-white to-violet-50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-violet-600">{t("utkarshQuantumHealth")}</p>
                <h2 className="mt-2 text-2xl font-semibold">{t("clientHealthReport")}</h2>
              </div>
              <div className="rounded-2xl border border-violet-200 bg-white p-3">
                <QrCode className="h-8 w-8 text-violet-600" />
              </div>
            </div>
            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-sm text-muted-foreground">{t("healthScore")}</p>
              <div className="mt-2 flex items-end gap-2">
                <span className="text-4xl font-semibold text-emerald-600">82</span>
                <span className="text-sm text-muted-foreground">{t("healthScoreSuffix")}</span>
              </div>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {sections.slice(0, 4).map((section) => (
                <div key={section.key} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700">
                  {t(section.key)}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">{t("pdfComponents")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>• {t("pdfComponentA4")}</p>
                <p>• {t("pdfComponentLogo")}</p>
                <p>• {t("pdfComponentQr")}</p>
                <p>• {t("pdfComponentCharts")}</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">{t("nextAction")}</CardTitle>
              </CardHeader>
              <CardContent>
                <Button className="w-full gap-2">
                  <Sparkles className="h-4 w-4" /> {t("previewFullReport")}
                </Button>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
