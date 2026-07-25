import React, { useEffect, useState } from "react";
import { Switch } from "./ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function ToggleSwitch({ isActive, data, onToggle }) {
  const [checked, setChecked] = useState(isActive);
  const [open, setOpen] = useState(false);
  const [nextState, setNextState] = useState(null);

  const handleSwitchChange = () => {
    setOpen(true);
  };

  const handleConfirm = async () => {
    setOpen(false);
    if (onToggle) {
      try {
        await onToggle(data);
        setChecked(!checked);
      } catch (error) {
        console.log(error);
      }
    }
  };

  useEffect(() => {
    if (isActive) {
      setChecked(true);
    } else {
      setChecked(false);
    }
  }, [checked]);
  const handleCancel = () => {
    setOpen(false);
    setNextState(null);
  };

  return (
    <>
      <div className="flex items-center space-x-2">
        <Switch checked={checked} onCheckedChange={handleSwitchChange} />
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {!isActive ? "Activate" : "Deactivate"} Confirmation
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to {!isActive ? "activate" : "deactivate"}
              this user?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 flex justify-end gap-2">
            <Button variant="secondary" onClick={handleCancel}>
              Cancel
            </Button>
            <Button variant={!isActive ? "default" : "destructive"} onClick={handleConfirm}>
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
