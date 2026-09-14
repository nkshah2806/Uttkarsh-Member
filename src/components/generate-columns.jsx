import React from "react";
import { createColumnHelper } from "@tanstack/react-table";
import LocalizedText from "@/components/LocalizedText";
const columnHelper = createColumnHelper();
const safeString = (value) => {
  if (typeof value === "object") {
    return JSON.stringify(value);
  }
  return String(value ?? "");
};
export const generateTableColumns = (headers) => {
  const baseColumns = headers.map(({ key, label }) =>
    columnHelper.accessor(key, {
      header: label,
      cell: (info) => {
        const value = info.getValue();

        // Render Badge for isAdmin
        if (key === "profileName" && typeof value === "object" && value?.props) {
          return value;
        }
        if (key === "isAdmin" && typeof value === "object" && value?.props) {
          return value;
        }
        if (key === "isActive" && typeof value === "object" && value?.props) {
          return value;
        }

        if (Array.isArray(value)) {
          return (
            <ul className="list-disc pl-4">
              {value.map((item, i) => (
                <li key={i}>
                  <LocalizedText value={item} fallback={safeString(item)} />
                </li>
              ))}
            </ul>
          );
        }
        if (typeof value === "object" && value !== null) {
          return (
            <span>
              {Object.values(value).map((v, i) => (
                <React.Fragment key={i}>
                  {i > 0 && ", "}
                  <LocalizedText value={v} fallback={safeString(v)} />
                </React.Fragment>
              ))}
            </span>
          );
        }
        return <LocalizedText value={value} fallback={safeString(value)} />;
      },
    })
  );
  return baseColumns;
};
