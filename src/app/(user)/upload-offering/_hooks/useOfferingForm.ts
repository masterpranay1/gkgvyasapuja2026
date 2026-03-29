import { useState } from "react";
import { OfferingFormData } from "../_components/types";

export function useOfferingForm() {
  const [formData, setFormData] = useState<OfferingFormData>({
    firstName: "",
    lastName: "",
    gender: "",
    email: "",
    phone: "",
    initiated: false,
    initiatedName: "",
    initiationType: "",
    initiationYear: "",
    countryId: "",
    stateId: "",
    cityId: "",
    templeId: "",
    language: "English",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const t = e.target;
    const { name, value } = t;
    const isCheckbox = t instanceof HTMLInputElement && t.type === "checkbox";
    setFormData((prev) => ({
      ...prev,
      [name]: isCheckbox ? t.checked : value,
    }));
  };

  const handleSelectChange = (name: string, value: string | null) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value || "",
    }));
  };

  return { formData, setFormData, handleInputChange, handleSelectChange };
}
