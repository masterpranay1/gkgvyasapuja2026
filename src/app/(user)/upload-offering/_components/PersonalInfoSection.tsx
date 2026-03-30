import React from "react";
import { Loader2 } from "lucide-react";
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
  /** When set, used for the email field so parent can reset modal state on edit. */
  onEmailChange?: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
  onEmailBlur?: () => void;
  isCheckingEmail?: boolean;
}

export function PersonalInfoSection({
  formData,
  handleInputChange,
  handleSelectChange,
  onEmailChange,
  onEmailBlur,
  isCheckingEmail,
}: Props) {
  return (
    <section>
      <div className="flex items-center gap-2 mb-6">
        <span className="text-amber-500">•</span>
        <h3 className="text-xs font-extrabold tracking-[0.22em] text-slate-500 uppercase">
          Core Details
        </h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8">
        <FormField
          label="First Name"
          subLabel="पहला नाम"
          required
        >
          <Input
            name="firstName"
            value={formData.firstName}
            onChange={handleInputChange}
            placeholder="John"
            className="h-12 px-6 bg-[#EEF3FF] border-transparent text-slate-800 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-amber-400/40 rounded-full text-base transition-colors"
          />
        </FormField>
        <FormField
          label="Last Name"
          subLabel="अंतिम नाम"
          required
        >
          <Input
            name="lastName"
            value={formData.lastName}
            onChange={handleInputChange}
            placeholder="Doe"
            className="h-12 px-6 bg-[#EEF3FF] border-transparent text-slate-800 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-amber-400/40 rounded-full text-base transition-colors"
          />
        </FormField>
        <FormField
          label="Email"
          subLabel="ईमेल"
          required
        >
          <div className="relative">
            <Input
              name="email"
              type="email"
              value={formData.email}
              onChange={onEmailChange ?? handleInputChange}
              onBlur={onEmailBlur}
              placeholder="john@example.com"
              disabled={isCheckingEmail}
              className="h-12 px-6 bg-[#EEF3FF] border-transparent text-slate-800 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-amber-400/40 rounded-full text-base transition-colors pr-12 disabled:opacity-70"
            />
            {isCheckingEmail && (
              <Loader2
                className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 animate-spin text-slate-500"
                aria-hidden
              />
            )}
          </div>
        </FormField>
        <FormField
          label="Phone"
          subLabel="फ़ोन नंबर"
          required
        >
          <Input
            name="phone"
            value={formData.phone}
            type="number"
            onChange={handleInputChange}
            placeholder="+1 234 567 890"
            className="h-12 py-6 px-6 bg-[#EEF3FF] border-transparent text-slate-800 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-amber-400/40 rounded-full text-base transition-colors"
          />
        </FormField>
        <FormField
          label="Gender"
          subLabel="लिंग"
          required
          className="space-y-3 md:col-span-2 lg:col-span-1"
        >
          <Select
            value={formData.gender}
            onValueChange={(val) => handleSelectChange("gender", val as string)}
          >
            <SelectTrigger className="h-12 w-full px-6 bg-[#EEF3FF] border-transparent text-slate-800 focus:ring-2 focus:ring-amber-400/40 rounded-full text-base transition-colors">
              <SelectValue placeholder="Select Gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                className="text-sm p-3 hover:bg-gray-50 cursor-pointer"
                value="male"
              >
                Male
              </SelectItem>
              <SelectItem
                className="text-sm p-3 hover:bg-gray-50 cursor-pointer"
                value="female"
              >
                Female
              </SelectItem>
              <SelectItem
                className="text-sm p-3 hover:bg-gray-50 cursor-pointer"
                value="other"
              >
                Other
              </SelectItem>
            </SelectContent>
          </Select>
        </FormField>
      </div>
    </section>
  );
}
