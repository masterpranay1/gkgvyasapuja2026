"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

type CountryItem = { id: string; name: string };

interface StatesCountryFilterProps {
  countries: CountryItem[];
}

export function StatesCountryFilter({ countries }: StatesCountryFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentCountry = searchParams.get("country") || "";

  const handleCountryChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("country", value);
    } else {
      params.delete("country");
    }
    params.delete("page");
    const q = params.toString();
    router.push(q ? `/admin-dashboard/states?${q}` : "/admin-dashboard/states");
  };

  const handleClear = () => {
    router.push("/admin-dashboard/states");
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 tracking-tight">
        Filter states
      </h2>
      <div className="flex flex-col sm:flex-row sm:items-end gap-4">
        <div className="flex flex-col gap-2 flex-1 max-w-md">
          <Label htmlFor="states-country-filter" className="text-sm font-medium">
            Country
          </Label>
          <select
            id="states-country-filter"
            value={currentCountry}
            onChange={(e) => handleCountryChange(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">All countries</option>
            {countries.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        {currentCountry && (
          <Button variant="outline" onClick={handleClear} className="text-sm shrink-0">
            Clear filter
          </Button>
        )}
      </div>
    </div>
  );
}
