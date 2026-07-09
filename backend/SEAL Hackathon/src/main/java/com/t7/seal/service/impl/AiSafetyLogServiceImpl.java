package com.t7.seal.service.impl;

import com.t7.seal.dto.ai.AiGuardrailResult;
import com.t7.seal.entities.AiConversation;
import com.t7.seal.entities.User;
import com.t7.seal.repository.AiSafetyLogRepository;
import com.t7.seal.response.assistant.AiSafetyLogResponse;
import com.t7.seal.service.AiSafetyLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AiSafetyLogServiceImpl implements AiSafetyLogService {

    private final AiSafetyLogRepository aiSafetyLogRepository;

    @Override
    public void record(
            User user,
            AiConversation conversation,
            AiGuardrailResult result,
            String message,
            String pageContext
    ) {

    }

    @Override
    public Page<AiSafetyLogResponse> listSafetyLogs(
            String decision,
            Pageable pageable
    ) {
        return null;
    }
}
