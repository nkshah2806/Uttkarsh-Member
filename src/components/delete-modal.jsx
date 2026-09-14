// components/delete-modal.jsx
import React from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import axiosInstance from "@/lib/axios";

export function DeleteButton({
  title,
  text,
  url,
  onClose,
  payload,
  invalidateKey,
}) {
  const { t } = useTranslation();
  const userDetails = JSON.parse(localStorage.getItem("UserDetails"));

  const handleDelete = async () => {
    try {
      if (payload) {
        await axiosInstance.put(url, {
          userId: payload?.id,
          isActive: payload?.isActive,
          createdBy: userDetails?._id,
        });
      } else {
        await axiosInstance.delete(url);
      }
      toast.success(t("demo.shared.deleteModal.deletedSuccess", { title }));
      onClose();
    } catch (error) {
      toast.error(t("demo.shared.deleteModal.deleteFailed"));
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {t("demo.shared.deleteModal.confirmBefore")}{" "}
            <strong>{text}</strong>
            {t("demo.shared.deleteModal.confirmAfter")}
          </DialogDescription>
          {/* <h2 className="text-lg font-semibold">{title}</h2>
          <p>
            Are you sure you want to delete <strong>{text}</strong>?
          </p> */}
        </DialogHeader>
        <DialogFooter className="mt-4 flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            {t("common.cancel")}
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            {t("common.delete")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
