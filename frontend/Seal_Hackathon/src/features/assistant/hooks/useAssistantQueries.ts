import { useQuery } from "@tanstack/react-query";
import { assistantApi } from "@/api/assistant.api";

export const assistantQueryKeys = {
  all: ["assistant"] as const,
  context: () => [...assistantQueryKeys.all, "context"] as const,
};

export const useAssistantContextQuery = () =>
  useQuery({
    queryKey: assistantQueryKeys.context(),
    queryFn: () => assistantApi.getContext(),
    retry: false,
  });
