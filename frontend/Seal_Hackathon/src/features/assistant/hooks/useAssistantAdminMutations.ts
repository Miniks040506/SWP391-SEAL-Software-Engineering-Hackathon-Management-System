import { useMutation, useQueryClient } from "@tanstack/react-query";
import { assistantAdminApi } from "@/api/assistantAdmin.api";
import { assistantAdminKeys } from "@/features/assistant/hooks/useAssistantAdminQueries";
import type { CreateKnowledgeDocumentRequest } from "@/types/assistant.types";

export function useCreateAiKnowledgeDocumentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateKnowledgeDocumentRequest) => assistantAdminApi.createKnowledgeDocument(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: assistantAdminKeys.knowledge() }),
  });
}

export function useSeedAiKnowledgeMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => assistantAdminApi.seedKnowledge(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: assistantAdminKeys.knowledge() }),
  });
}

export function useReindexAiKnowledgeMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => assistantAdminApi.reindexKnowledge(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: assistantAdminKeys.knowledge() }),
  });
}
