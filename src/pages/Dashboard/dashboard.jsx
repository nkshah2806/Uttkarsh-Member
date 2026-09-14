import React from "react";
import { useTranslation } from "react-i18next";
import { CardTitle } from "@/components/ui/card";

export default function Dashboard() {
  const { t } = useTranslation();

  return (
    <>
      <div className="flex items-center justify-between mb-5.75">
        <CardTitle className="font-semibold text-[30px]">
          {t("demo.dashboard.title")}
        </CardTitle>
      </div>
    </>
  );
}
