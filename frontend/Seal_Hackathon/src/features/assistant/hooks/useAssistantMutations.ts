import { useMutation, useQueryClient } from "@tanstack/react-query";
import { assistantApi } from "@/api/assistant.api";
import { assistantQueryKeys } from "@/features/assistant/hooks/useAssistantQueries";
import type { AssistantChatRequest } from "@/types/assistant.types";

export const useAssistantChatMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AssistantChatRequest) => assistantApi.chat(payload),
    onSuccess: (response) => {
      void queryClient.invalidateQueries({
        queryKey: assistantQueryKeys.conversations(),
      });
      void queryClient.invalidateQueries({
        queryKey: assistantQueryKeys.messages(response.conversationId),
      });
    },
  });
};
