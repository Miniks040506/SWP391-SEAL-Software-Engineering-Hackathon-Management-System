package com.t7.seal.service;

import com.t7.seal.dto.ai.AiGuardrailResult;
import com.t7.seal.entities.User;
import com.t7.seal.request.assistant.AssistantChatRequest;

public interface AiGuardrailService {

    AiGuardrailResult evaluateInput(AssistantChatRequest request, User user);

    AiGuardrailResult evaluateOutput(String answer, User user);
}
