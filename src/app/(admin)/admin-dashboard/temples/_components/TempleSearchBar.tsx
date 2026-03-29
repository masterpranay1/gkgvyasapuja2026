"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function TempleSearchBar({ initialQuery }: { initialQuery: string }) {
  const router = useRouter();
  const [value, setValue] = useState(initialQuery);

  useEffect(() => {
    setValue(initialQuery);
  }, [initialQuery]);

  function buildHref(q: string, page?: number) {
    const p = new URLSearchParams();
    const t = q.trim();
    if (t) p.set("q", t);
    if (page && page > 1) p.set("page", String(page));
    const qs = p.toString();
    return qs ? `/admin-dashboard/temples?${qs}` : "/admin-dashboard/temples";
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    router.push(buildHref(value));
  }

  function handleClear() {
    setValue("");
    router.push("/admin-dashboard/temples");
  }

  const hasQuery = value.trim().length > 0;

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-col sm:flex-row sm:flex-wrap sm:items-end gap-4"
    >
      <div className="flex flex-col gap-2 flex-1 min-w-[200px]">
        <Label htmlFor="temple-search" className="text-sm font-medium">
          Search temples
        </Label>
        <Input
          id="temple-search"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Name, city, or state…"
          autoComplete="off"
          className="max-w-xl"
        />
      </div>
      <div className="flex gap-2">
        <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
          Search
        </Button>
        {hasQuery && (
          <Button type="button" variant="outline" onClick={handleClear}>
            Clear
          </Button>
        )}
      </div>
    </form>
  );
}
