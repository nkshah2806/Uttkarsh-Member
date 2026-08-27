import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import ReusableTable from "@/components/ReusableTable";
import { getAllUsers, toggleUserStatus } from "@/services/userService"; // You'll create this
import { useApiMutation } from "@/hooks/useApiMutation";
import { Button } from "@/components/ui/button";
import { Eye, PencilRuler } from "lucide-react";
import DeleteDialog from "@/components/DeleteDialog";
import user from "../../assets/user.png";
import { toast } from "sonner";
import { useLanguage } from "@/context/LanguageContext";

export default function User() {
  const navigate = useNavigate();
  const tableRef = useRef();
  const { t } = useLanguage();

  const headers = [
    {
      key: "sNo",
      label: t("sNo"),
      filterable: false,
    },
    {
      key: "profileUrl",
      label: t("profile"),
      filterable: false,
      render: (row) => (
        <img
          className="w-10 h-10 rounded-full object-cover flex-none"
          src={row.profileUrl}
          alt={`${row.firstname} ${t("profile")}`}
          onError={({ currentTarget }) => {
            currentTarget.onerror = null;
            currentTarget.src = user;
          }}
        />
      ),
    },
    {
      key: "name",
      label: t("fullName"),
      filterable: true,
    },
    { key: "email", label: t("email"), filterable: true },
    { key: "phone", label: t("phone"), filterable: true },
    {
      key: "role",
      label: t("adminOrUser"),
      filterable: true,
      render: (row) => (
        <Badge variant={row.role === "admin" ? "destructive" : "default"} className="capitalize min-w-auto">
          {row.role === "admin" ? t("admin") : t("member")}
        </Badge>
      ),
    },
    {
      key: "createdAt",
      label: t("createdAt"),
      filterable: true,
    },
    {
      key: "isActive",
      label: t("isActive"),
      filterable: true,
      render: (row) => (
        <DeleteDialog
          title={row.isActive ? t("inactiveUserConfirm") : t("activeUserConfirm")}
          des={(row.isActive ? t("deactivateUserConfirm") : t("activateUserConfirm")).replace(
            "{name}",
            row.fullName
          )}
          row={row}
          handleToggleChange={HandleDelete}
          disabled={row?.isAdmin}
        />
      ),
    },
    {
      key: "actions",
      label: t("actions"),
      render: (row) => (
        <div className="flex gap-3">
          <Button onClick={() => navigate(`/user/${row._id}`)}><Eye /></Button>
          {row.isActive && (
            <Button variant="outline" onClick={() => handleAction(row, "edit")}>
              <PencilRuler className="size-5" strokeWidth={1.5} />
            </Button>
          )}
        </div>
      ),
    },
  ];

  const handleAction = (user) => {
    navigate(`edit/${user.id}`);
  };

  const deleteUserMutation = useApiMutation(
    ({ id, data }) => toggleUserStatus(id, data),
    {
      successMessage: t("statusUpdated"),
      onSuccess: () => {
        if (tableRef.current) {
          tableRef.current.refetchTable();
        }
      },
      onError: (err) => {
        toast.error(err?.response?.data?.message || t("failedDeleteUser"));
      },
    }
  );

  const HandleDelete = (data, status) => {
    deleteUserMutation.mutate({
      id: data.id,
      data: {
        userId: data.id,
        isActive: status,
      },
    });
  };

  const handleSelectionChange = (selectedRows) => {
    console.log("Selected users:", selectedRows);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("listOfUsers")}</CardTitle>
        <CardDescription>{t("allUserInfo")}</CardDescription>
      </CardHeader>
      <CardContent>
        <ReusableTable
          routeType={`table-User`}
          ref={tableRef}
          headers={headers}
          apiPagination
          fetchData={getAllUsers}
          selectable={false}
          onSelectionChange={handleSelectionChange}
          DateRange={true}
          Search={true}
        />
      </CardContent>
    </Card>
  );
}
