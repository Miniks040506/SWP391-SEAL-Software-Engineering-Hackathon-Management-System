import { useQuery } from "@tanstack/react-query";
import { assistantApi } from "@/api/assistant.api";
import type { UUID } from "@/types/common.types";

export const assistantQueryKeys = {
  all: ["assistant"] as const,
  context: () => [...assistantQueryKeys.all, "context"] as const,
  conversations: () => [...assistantQueryKeys.all, "conversations"] as const,
  messages: (conversationId?: UUID) =>
    [...assistantQueryKeys.all, "messages", conversationId] as const,
};

export const useAssistantContextQuery = (enabled = true) =>
  useQuery({
    queryKey: assistantQueryKeys.context(),
    queryFn: () => assistantApi.getContext(),
    enabled,
    retry: false,
  });

export const useAssistantConversationsQuery = (enabled = true) =>
  useQuery({
    queryKey: assistantQueryKeys.conversations(),
    queryFn: () => assistantApi.getConversations(),
    enabled,
    retry: false,
  });

export const useAssistantMessagesQuery = (
  conversationId?: UUID,
  enabled = true,
) =>
  useQuery({
    queryKey: assistantQueryKeys.messages(conversationId),
    queryFn: () => assistantApi.getConversationMessages(conversationId!),
    enabled: enabled && Boolean(conversationId),
    retry: false,
  });
