"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUseSaved: () => void;
  onSkipAndReenter: () => void;
};

export function ExistingUserModal({
  open,
  onOpenChange,
  onUseSaved,
  onSkipAndReenter,
}: Props) {
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      disablePointerDismissal
    >
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-md bg-[#0a2540] text-white border border-white/15 ring-white/10"
      >
        <DialogHeader>
          <DialogTitle className="text-lg text-white">
            We already have your profile
          </DialogTitle>
          <DialogDescription className="text-blue-100/90 text-sm">
            This email is registered. You can load your saved details to save
            time, or clear the form and enter everything again (your email will
            stay). Your submission will update your existing record.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-2 border-t-0 bg-transparent p-0 pt-2">
          <Button
            type="button"
            variant="outline"
            className="w-full sm:w-auto border-white/25 text-white bg-white/5 hover:bg-white/10"
            onClick={() => {
              onSkipAndReenter();
              onOpenChange(false);
            }}
          >
            Skip and re-enter
          </Button>
          <Button
            type="button"
            className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600 text-white"
            onClick={() => {
              onUseSaved();
              onOpenChange(false);
            }}
          >
            Fill with saved information
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
