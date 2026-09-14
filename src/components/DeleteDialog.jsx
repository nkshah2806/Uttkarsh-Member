import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "./ui/button";
import { Switch } from "./ui/switch";
import { toast } from "sonner";

export default function DeleteDialog({
  title,
  des,
  row,
  handleToggleChange,
  disabled,
}) {
  const { t } = useTranslation();
  const [open, setOpen] = React.useState(false);
  const [checkedState, setCheckedState] = React.useState(false); // state to manage switch
  const [pendingState, setPendingState] = React.useState(null); // temp state to apply after confirm

  const handleSwitchChange = (checked) => {
    if (disabled) {
      toast.error(t("demo.shared.deleteDialog.disabledForUser"));
      return; // If disabled, do nothing
    }
    setPendingState(checked);
    setOpen(true); // Always open dialog on any change
  };
  useEffect(() => {
    if (row) {
      setCheckedState(row.isActive);
    }
  }, [row]);

  const confirmChange = () => {
    handleToggleChange(row, pendingState);
    setCheckedState(pendingState);
    setPendingState(null);
    setOpen(false);
  };

  const cancelDialog = () => {
    setPendingState(null);
    setOpen(false);
  };

  return (
    <>
      <Switch checked={checkedState} onCheckedChange={handleSwitchChange} />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{des}</DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={cancelDialog}>
              {t("common.cancel")}
            </Button>
            <Button variant="destructive" onClick={confirmChange}>
              {t("common.confirm")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
