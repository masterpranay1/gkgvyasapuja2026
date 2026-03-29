"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { deleteMaintainer } from "@/app/(admin)/actions/maintainers";
import { cn } from "@/lib/utils";

export function DeleteMaintainerButton({
  maintainerId,
  loginId,
}: {
  maintainerId: string;
  loginId: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleClick() {
    if (
      !confirm(
        `Delete maintainer "${loginId}"? They will no longer be able to sign in.`,
      )
    ) {
      return;
    }
    startTransition(async () => {
      const res = await deleteMaintainer(maintainerId);
      if (!res.success) {
        alert(res.error ?? "Could not delete maintainer.");
        return;
      }
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      aria-label={`Delete ${loginId}`}
      className={cn(
        "inline-flex items-center justify-center rounded-md p-1.5 text-gray-400 transition-colors",
        "hover:bg-red-50 hover:text-red-600",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        "disabled:pointer-events-none disabled:opacity-40",
      )}
    >
      <Trash2 className="size-4" />
    </button>
  );
}
