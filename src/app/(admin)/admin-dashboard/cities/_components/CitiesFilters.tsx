"use client";

import { useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  searchCountries,
  searchStates,
} from "@/app/(admin)/actions/admin";
import {
  AsyncSearchCombobox,
  type ComboboxItem,
} from "./AsyncSearchCombobox";

function buildQuery(params: URLSearchParams) {
  const q = params.toString();
  return q ? `/admin-dashboard/cities?${q}` : "/admin-dashboard/cities";
}

interface CitiesFiltersProps {
  initialCountry: ComboboxItem | null;
  initialState: ComboboxItem | null;
}

export function CitiesFilters({
  initialCountry,
  initialState,
}: CitiesFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const searchCountriesStable = useCallback((q: string) => searchCountries(q), []);

  const searchStatesStable = useCallback(
    (q: string) => searchStates(q, { countryId: initialCountry?.id }),
    [initialCountry?.id],
  );

  function pushParams(next: URLSearchParams) {
    router.push(buildQuery(next));
  }

  function applyCountry(next: ComboboxItem | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (next) {
      params.set("country", next.id);
    } else {
      params.delete("country");
    }
    params.delete("state");
    params.delete("page");
    pushParams(params);
  }

  function applyState(next: ComboboxItem | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (next) {
      params.set("state", next.id);
    } else {
      params.delete("state");
    }
    params.delete("page");
    pushParams(params);
  }

  function handleClearAll() {
    router.push("/admin-dashboard/cities");
  }

  const hasFilter = Boolean(initialCountry || initialState);

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 tracking-tight">
        Filter cities
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AsyncSearchCombobox
          id="cities-filter-country"
          label="Country"
          placeholder="Search country by name…"
          search={searchCountriesStable}
          value={initialCountry}
          onChange={applyCountry}
        />
        <AsyncSearchCombobox
          id="cities-filter-state"
          label="State"
          placeholder={
            initialCountry
              ? "Search state in selected country…"
              : "Search state by name…"
          }
          search={searchStatesStable}
          value={initialState}
          onChange={applyState}
        />
      </div>
      {hasFilter && (
        <div className="mt-4 flex justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={handleClearAll}
            className="text-sm"
          >
            Clear filters
          </Button>
        </div>
      )}
    </div>
  );
}
