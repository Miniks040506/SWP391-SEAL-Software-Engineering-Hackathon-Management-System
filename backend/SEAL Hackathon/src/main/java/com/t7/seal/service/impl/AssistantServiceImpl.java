package com.t7.seal.service.impl;

import com.t7.seal.request.assistant.AssistantChatRequest;
import com.t7.seal.response.assistant.AssistantChatResponse;
import com.t7.seal.response.assistant.AssistantContextResponse;
import com.t7.seal.response.assistant.AssistantConversationResponse;
import com.t7.seal.response.assistant.AssistantMessageResponse;
import com.t7.seal.service.AssistantService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AssistantServiceImpl implements AssistantService {
    @Override
    public AssistantChatResponse chat(AssistantChatRequest request, Authentication authentication) {
        return null;
    }

    @Override
    public AssistantContextResponse getContext(Authentication authentication) {
        return null;
    }

    @Override
    public List<AssistantConversationResponse> listConversations(Authentication authentication) {
        return List.of();
    }

    @Override
    public List<AssistantMessageResponse> getConversationMessages(UUID conversationId, Authentication authentication) {
        return List.of();
    }
}
