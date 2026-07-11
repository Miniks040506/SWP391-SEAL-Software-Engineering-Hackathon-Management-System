import { apiRequest } from "@/api/apiRequest";
import type {
  AssistantChatRequest,
  AssistantChatResponse,
  AssistantContextResponse,
  AssistantConversationResponse,
  AssistantMessageResponse,
} from "@/types/assistant.types";
import type { UUID } from "@/types/common.types";

export const assistantApi = {
  getContext() {
    return apiRequest.get<AssistantContextResponse>("/assistant/context");
  },

  chat(payload: AssistantChatRequest) {
    return apiRequest.post<AssistantChatResponse>("/assistant/chat", payload);
  },

  getConversations() {
    return apiRequest.get<AssistantConversationResponse[]>("/assistant/conversations");
  },

  getConversationMessages(conversationId: UUID) {
    return apiRequest.get<AssistantMessageResponse[]>(`/assistant/conversations/${conversationId}/messages`);
  },
};
