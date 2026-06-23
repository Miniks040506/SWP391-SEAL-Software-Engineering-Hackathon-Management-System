import { useState } from "react";

export const useScoreMutations = () => {
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

  const saveDraft = async (data: any) => {
    setIsSaving(true);
    console.log("Saving draft...", data);
    await new Promise((resolve) => setTimeout(resolve, 500));
    setLastSavedAt(new Date());
    setIsSaving(false);
  };

  const finalSubmit = async (data: any) => {
    setIsSubmitting(true);
    console.log("Final submitting...", data);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsSubmitting(false);
  };

  return { saveDraft, finalSubmit, isSaving, isSubmitting, lastSavedAt };
};
