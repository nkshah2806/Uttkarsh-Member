// components/delete-modal.jsx
import React from "react";
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
      toast.success(`${title} deleted successfully`);
      onClose();
    } catch (error) {
      toast.error("Failed to delete");
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete <strong>{text}</strong>?
          </DialogDescription>
          {/* <h2 className="text-lg font-semibold">{title}</h2>
          <p>
            Are you sure you want to delete <strong>{text}</strong>?
          </p> */}
        </DialogHeader>
        <DialogFooter className="mt-4 flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
