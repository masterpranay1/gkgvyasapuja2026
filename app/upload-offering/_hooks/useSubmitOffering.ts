import { useState } from "react";
import { submitOffering } from "@/app/actions/offering";
import { OfferingFormData } from "../_components/types";

export function useSubmitOffering(
  formData: OfferingFormData,
  file: File | null,
  extractedText: string,
  setError: (error: string | null) => void,
) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const validateForm = () => {
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.phone ||
      !formData.gender
    ) {
      setError("Please fill in all required personal information fields.");
      return false;
    }
    if (formData.initiated) {
      if (
        !formData.initiatedName ||
        !formData.initiationType ||
        !formData.initiationYear
      ) {
        setError("Please fill in all initiation details.");
        return false;
      }
    }
    if (
      !formData.countryId ||
      !formData.stateId ||
      !formData.cityId ||
      !formData.templeId
    ) {
      setError(
        "Please complete your location selection (Country down to Temple).",
      );
      return false;
    }
    if (!file || !extractedText) {
      setError("Please upload a valid .docx offering document.");
      return false;
    }
    setError(null);
    return true;
  };

  const submitFinal = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    setError(null);
    const result = await submitOffering({
      ...formData,
      offeringText: extractedText,
    });
    setIsSubmitting(false);

    if (result.success) {
      setSuccess(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      setError(result.error || "Failed to submit offering.");
    }
  };

  return { isSubmitting, success, submitFinal };
}
