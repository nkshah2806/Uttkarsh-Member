import React from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserPlus, PencilLine, Trash2, History } from "lucide-react";
import ReusableTable from "@/components/ReusableTable";
import LocalizedText from "@/components/LocalizedText";
const clients = [];

const statusColors = {
  High: "bg-rose-100 text-rose-700",
  Low: "bg-amber-100 text-amber-700",
  Normal: "bg-emerald-100 text-emerald-700",
};

const getHeaders = (t) => [
  {
    key: "name",
    label: t("demo.clientManagement.clientName"),
    render: (row) => (
      <span className="font-semibold">
        <LocalizedText value={row.name} />
      </span>
    ),
  },
  { key: "mobile", label: t("demo.clientManagement.mobileNumber") },
  { key: "reportId", label: t("demo.clientManagement.reportId") },
  { key: "date", label: t("demo.clientManagement.date") },
  {
    key: "status",
    label: t("demo.clientManagement.status"),
    render: (row) => (
      <span
        className={`rounded-full px-3 py-1 text-xs font-semibold ${statusColors[row.status] || "bg-slate-100 text-slate-700"
          }`}
      >
        <LocalizedText value={row.status} />
      </span>
    ),
  },
  {
    key: "actions",
    label: t("demo.clientManagement.actions"),
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

const AddClientButton = ({ t }) => {
  return (
    <Button className="gap-2">
      <UserPlus className="h-4 w-4" /> {t("demo.clientManagement.addClient")}
    </Button>
  );
};

export default function ClientManagement() {
  const { t } = useTranslation();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{t("demo.clientManagement.title")}</h1>
        <p className="text-sm text-muted-foreground">
          {t("demo.clientManagement.subtitle")}
        </p>
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <ReusableTable
            headers={getHeaders(t)}
            data={clients}
            Search={t("demo.clientManagement.searchPlaceholder")}
            CreateExportRender={() => <AddClientButton t={t} />}
            pagination={true}
          />
        </CardContent>
      </Card>
    </div>
  );
}
