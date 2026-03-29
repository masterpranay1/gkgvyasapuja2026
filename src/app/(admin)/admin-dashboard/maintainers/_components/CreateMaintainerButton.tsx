"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import { createMaintainer } from "@/app/(admin)/actions/maintainers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type CreateResult =
  | { success: true; loginId: string; password: string }
  | { success: false; error: string };

export function CreateMaintainerButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<CreateResult | null>(null);

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      setError(null);
      setCreated(null);
    }
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await createMaintainer(null, fd);
      if (res.success) {
        setCreated(res);
        router.refresh();
      } else {
        setError(res.error);
      }
    });
  }

  return (
    <>
      <Button
        type="button"
        className="bg-indigo-600 hover:bg-indigo-700"
        onClick={() => handleOpenChange(true)}
      >
        Add maintainer
      </Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {created?.success ? "New maintainer credentials" : "Create maintainer"}
            </DialogTitle>
          </DialogHeader>

          {created?.success ? (
            <div className="space-y-3 text-sm">
              <p className="text-gray-600">
                Copy these now. The password cannot be shown again unless you
                regenerate it from Edit.
              </p>
              <div>
                <Label>Maintainer ID</Label>
                <p className="mt-1 font-mono rounded-md bg-gray-50 px-3 py-2 border">
                  {created.loginId}
                </p>
              </div>
              <div>
                <Label>Password</Label>
                <p className="mt-1 font-mono rounded-md bg-gray-50 px-3 py-2 border break-all">
                  {created.password}
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => {
                  const text = `ID: ${created.loginId}\nPassword: ${created.password}`;
                  void navigator.clipboard.writeText(text);
                }}
              >
                Copy ID and password
              </Button>
              <Button
                type="button"
                className="w-full bg-indigo-600 hover:bg-indigo-700"
                onClick={() => handleOpenChange(false)}
              >
                Done
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="create-label">Label (optional)</Label>
                <Input
                  id="create-label"
                  name="label"
                  placeholder="e.g. Temple coordinator"
                />
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={pending}>
                  {pending ? "Creating..." : "Create"}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
