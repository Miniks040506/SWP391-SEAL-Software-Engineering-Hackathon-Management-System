package com.t7.seal.service;

import com.t7.seal.request.assistant.AssistantChatRequest;
import com.t7.seal.response.assistant.AssistantChatResponse;
import com.t7.seal.response.assistant.AssistantContextResponse;
import com.t7.seal.response.assistant.AssistantConversationResponse;
import com.t7.seal.response.assistant.AssistantMessageResponse;
import org.springframework.security.core.Authentication;

import java.util.List;
import java.util.UUID;

public interface AssistantService {

    AssistantChatResponse chat(AssistantChatRequest request, Authentication authentication);

    AssistantContextResponse getContext(Authentication authentication);

    List<AssistantConversationResponse> listConversations(Authentication authentication);

    List<AssistantMessageResponse> getConversationMessages(UUID conversationId,
                                                           Authentication authentication);
}
