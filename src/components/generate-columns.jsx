import { createColumnHelper } from "@tanstack/react-table";
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
                <li key={i}>{safeString(item)}</li>
              ))}
            </ul>
          );
        }
        if (typeof value === "object" && value !== null) {
          return Object.values(value).map(safeString).join(", ");
        }
        return safeString(value);
      },
    })
  );
  return baseColumns;
};
