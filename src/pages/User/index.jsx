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

export default function User() {
  const navigate = useNavigate();
  const tableRef = useRef();

  const headers = [
    {
      key: "sNo",
      label: "S. No.",
      filterable: false,
    },
    {
      key: "profileUrl",
      label: "Profile",
      filterable: false,
      render: (row) => (
        <img
          className="w-10 h-10 rounded-full object-cover flex-none"
          src={row.profileUrl}
          alt={`${row.firstname} profile`}
          onError={({ currentTarget }) => {
            currentTarget.onerror = null;
            currentTarget.src = user;
          }}
        />
      ),
    },
    {
      key: "name",
      label: "Full Name",
      filterable: true,
    },
    { key: "email", label: "Email", filterable: true },
    { key: "phone", label: "Phone Number", filterable: true },
    {
      key: "role",
      label: "Admin/User",
      filterable: true,
      render: (row) => (
        <Badge variant={row.role === "admin" ? "destructive" : "default"} className="capitalize min-w-auto">
          {row.role}
        </Badge>
      ),
    },
    {
      key: "createdAt",
      label: "Created At",
      filterable: true,
    },
    {
      key: "isActive",
      label: "isActive",
      filterable: true,
      render: (row) => (
        <DeleteDialog
          title={`${!row.isActive ? "Active" : "Inactive"} User?`}
          des={`Are you sure you want to ${!row.isActive ? "Active" : "InActive"
            } ${row.fullName}?`}
          row={row}
          handleToggleChange={HandleDelete}
          disabled={row?.isAdmin}
        />
      ),
    },
    {
      key: "actions",
      label: "Actions",
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
      successMessage: "Status updated successfully",
      onSuccess: () => {
        if (tableRef.current) {
          tableRef.current.refetchTable();
        }
      },
      onError: (err) => {
        toast.error(err?.response?.data?.message || "Failed to delete user");
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
        <CardTitle>List of Users</CardTitle>
        <CardDescription>All user information below.</CardDescription>
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
