package com.t7.seal.service.impl;

import com.t7.seal.dto.ai.AiGuardrailResult;
import com.t7.seal.entities.User;
import com.t7.seal.request.assistant.AssistantChatRequest;
import com.t7.seal.service.AiGuardrailService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AiGuardrailServiceImpl implements AiGuardrailService {
    @Override
    public AiGuardrailResult evaluateInput(AssistantChatRequest request, User user) {
        return null;
    }

    @Override
    public AiGuardrailResult evaluateOutput(String answer, User user) {
        return null;
    }
}
