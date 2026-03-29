"use client";

import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addCity, searchCountries, searchStates } from "@/app/(admin)/actions/admin";
import { Plus } from "lucide-react";
import {
  AsyncSearchCombobox,
  type ComboboxItem,
} from "./AsyncSearchCombobox";

export function AddCityModal() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [country, setCountry] = useState<ComboboxItem | null>(null);
  const [state, setState] = useState<ComboboxItem | null>(null);

  function handleCountryChange(next: ComboboxItem | null) {
    setCountry(next);
    setState(null);
  }

  const searchCountriesCb = useCallback(
    (q: string) => searchCountries(q),
    [],
  );
  const searchStatesCb = useCallback(
    (q: string) => searchStates(q, { countryId: country?.id }),
    [country?.id],
  );

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const name = (formData.get("name") as string)?.trim();

    if (!name) {
      setError("Name is required.");
      setLoading(false);
      return;
    }
    if (!state?.id) {
      setError("Please search and select a state.");
      setLoading(false);
      return;
    }

    const result = await addCity({ name, stateId: state.id });
    if (result.success) {
      setOpen(false);
      setCountry(null);
      setState(null);
    } else {
      setError(result.error || "Failed to add city");
    }
    setLoading(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm flex items-center gap-2" />
        }
      >
        <Plus className="w-4 h-4" /> Add City
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New City</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="grid gap-4 py-4">
          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name *
            </Label>
            <Input id="name" name="name" required className="col-span-3" />
          </div>

          <div className="space-y-4 col-span-full">
            <p className="text-xs text-muted-foreground">
              Optional: pick a country first to narrow state search.
            </p>
            <AsyncSearchCombobox
              id="add-city-country"
              label="Country (optional)"
              placeholder="Search country…"
              search={searchCountriesCb}
              value={country}
              onChange={handleCountryChange}
            />
            <AsyncSearchCombobox
              id="add-city-state"
              label="State *"
              placeholder={
                country
                  ? "Search state in selected country…"
                  : "Search state…"
              }
              search={searchStatesCb}
              value={state}
              onChange={setState}
            />
          </div>

          <div className="mt-4 flex justify-end">
            <Button
              type="submit"
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {loading ? "Adding..." : "Save City"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
