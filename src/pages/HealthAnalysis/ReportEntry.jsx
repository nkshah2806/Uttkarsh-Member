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
import { useLanguage } from "@/context/LanguageContext";

const parameters = [
  { nameKey: "paramBodyTemp", value: "98.6°F", statusKey: "normal" },
  { nameKey: "paramBloodPressure", value: "124/82", statusKey: "high" },
  { nameKey: "paramHemoglobin", value: "12.8 g/dL", statusKey: "low" },
  { nameKey: "paramBloodSugar", value: "94 mg/dL", statusKey: "normal" },
];

export default function ReportEntry() {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{t("reportEntryTitle")}</h1>
          <p className="text-sm text-muted-foreground">{t("reportEntryDescription")}</p>
        </div>
        <Button className="gap-2">
          <Sparkles className="h-4 w-4" /> {t("generateReport")}
        </Button>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>{t("clientReportDetails")}</CardTitle>
          <CardDescription>{t("clientReportDetailsDesc")}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <Input placeholder={t("clientName")} />
          <Input placeholder={t("reportId")} />
          <Input placeholder={t("consultantName")} />
          <Input placeholder={t("date")} />
          <Textarea className="md:col-span-2" placeholder={t("phClinicalNotes")} />
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>{t("parameterEntry")}</CardTitle>
          <CardDescription>{t("parameterEntryDesc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {parameters.map((parameter) => (
              <div key={parameter.nameKey} className="rounded-2xl border border-slate-200 p-4">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{t(parameter.nameKey)}</p>
                  <span className={`rounded-full px-3 py-1 text-sm font-medium ${parameter.statusKey === "high" ? "bg-rose-100 text-rose-700" : parameter.statusKey === "low" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>
                    {t(parameter.statusKey)}
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
              <p className="font-semibold">{t("autoStatus")}</p>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{t("autoStatusDesc")}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-amber-600">
              <AlertTriangle className="h-5 w-5" />
              <p className="font-semibold">{t("colorCoding")}</p>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{t("colorCodingDesc")}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-violet-600">
              <CircleDollarSign className="h-5 w-5" />
              <p className="font-semibold">{t("reportNotes")}</p>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{t("reportNotesDesc")}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
