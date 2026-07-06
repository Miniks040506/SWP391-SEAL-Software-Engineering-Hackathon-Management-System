package com.t7.seal.service;

import com.t7.seal.dto.ai.AiGuardrailResult;
import com.t7.seal.entities.AiConversation;
import com.t7.seal.entities.User;
import com.t7.seal.response.assistant.AiSafetyLogResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface AiSafetyLogService {

    void record(
            User user,
            AiConversation conversation,
            AiGuardrailResult result,
            String message,
            String pageContext
    );

    Page<AiSafetyLogResponse> listSafetyLogs(String decision, Pageable pageable);
}
