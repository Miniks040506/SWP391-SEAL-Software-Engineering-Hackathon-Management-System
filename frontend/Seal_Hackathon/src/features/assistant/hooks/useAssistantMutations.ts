import { useMutation } from "@tanstack/react-query";
import { assistantApi } from "@/api/assistant.api";
import type { AssistantChatRequest } from "@/types/assistant.types";

export const useAssistantChatMutation = () =>
  useMutation({
    mutationFn: (payload: AssistantChatRequest) => assistantApi.chat(payload),
  });
