import React from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { OfferingFormData } from "./types";
import { FormField } from "./FormField";

interface Props {
  formData: OfferingFormData;
  handleInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
  handleSelectChange: (name: string, value: string) => void;
}

export function InitiationSection({
  formData,
  handleInputChange,
  handleSelectChange,
}: Props) {
  return (
    <section className="py-2">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-amber-500">•</span>
        <h3 className="text-xs font-extrabold tracking-[0.22em] text-slate-500 uppercase">
          Spiritual Status
        </h3>
      </div>

      <div className="space-y-4">
        <p className="text-sm font-semibold text-slate-800">
          Are you initiated?
        </p>
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() =>
              handleInputChange({
                target: { name: "initiated", type: "checkbox", checked: true },
              } as unknown as React.ChangeEvent<HTMLInputElement>)
            }
            className={[
              "h-12 rounded-full border text-sm font-semibold transition-colors",
              formData.initiated
                ? "bg-white border-amber-400/70 text-slate-900 shadow-sm"
                : "bg-[#EEF3FF] border-transparent text-slate-700 hover:bg-[#E6EEFF]",
            ].join(" ")}
          >
            Yes, I am
          </button>
          <button
            type="button"
            onClick={() =>
              handleInputChange({
                target: {
                  name: "initiated",
                  type: "checkbox",
                  checked: false,
                },
              } as unknown as React.ChangeEvent<HTMLInputElement>)
            }
            className={[
              "h-12 rounded-full border text-sm font-semibold transition-colors",
              !formData.initiated
                ? "bg-white border-amber-400/70 text-slate-900 shadow-sm"
                : "bg-[#EEF3FF] border-transparent text-slate-700 hover:bg-[#E6EEFF]",
            ].join(" ")}
          >
            Not yet
          </button>
        </div>
      </div>

      {formData.initiated && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-8 animate-in slide-in-from-top-4 fade-in duration-500 mt-6">
          <FormField
            label="Initiated Name"
            subLabel="दीक्षित नाम"
            required
          >
            <Input
              name="initiatedName"
              value={formData.initiatedName}
              onChange={handleInputChange}
              placeholder="Das/Dasi"
              className="h-12 px-6 bg-[#EEF3FF] border-transparent text-slate-800 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-amber-400/40 rounded-full text-base transition-colors"
            />
          </FormField>
          <FormField
            label="Initiation Type"
            subLabel="दीक्षा का प्रकार"
            required
          >
            <Select
              value={formData.initiationType}
              onValueChange={(val) =>
                handleSelectChange("initiationType", val as string)
              }
            >
              <SelectTrigger className="h-12 w-full px-6 bg-[#EEF3FF] border-transparent text-slate-800 focus:ring-2 focus:ring-amber-400/40 rounded-full text-base transition-colors">
                <SelectValue placeholder="Select Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  value="Harinam"
                  className="text-sm p-3 hover:bg-gray-50 cursor-pointer"
                >
                  Harinam
                </SelectItem>
                <SelectItem
                  value="Brahman"
                  className="text-sm p-3 hover:bg-gray-50 cursor-pointer"
                >
                  Brahman
                </SelectItem>
                <SelectItem
                  value="Sannyas"
                  className="text-sm p-3 hover:bg-gray-50 cursor-pointer"
                >
                  Sannyas
                </SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField
            label="Year of Initiation"
            subLabel="दीक्षा का वर्ष"
            required
          >
            <Input
              name="initiationYear"
              value={formData.initiationYear}
              onChange={handleInputChange}
              placeholder="YYYY"
              type="number"
              className="h-12 px-6 bg-[#EEF3FF] border-transparent text-slate-800 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-amber-400/40 rounded-full text-base transition-colors"
            />
          </FormField>
        </div>
      )}
    </section>
  );
}
