package com.t7.seal.service.impl;

import com.t7.seal.dto.ai.AiGuardrailResult;
import com.t7.seal.entities.AiConversation;
import com.t7.seal.entities.AiSafetyLog;
import com.t7.seal.entities.User;
import com.t7.seal.repository.AiSafetyLogRepository;
import com.t7.seal.response.assistant.AiSafetyLogResponse;
import com.t7.seal.service.AiSafetyLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;

@Service
@RequiredArgsConstructor
public class AiSafetyLogServiceImpl implements AiSafetyLogService {

    private final AiSafetyLogRepository aiSafetyLogRepository;

    @Override
    @Transactional
    public void record(
            User user,
            AiConversation conversation,
            AiGuardrailResult result,
            String message,
            String pageContext
    ) {
        if (result == null) {
            return;
        }

        aiSafetyLogRepository.save(AiSafetyLog.builder()
                .user(user)
                .conversation(conversation)
                .decision(result.decision())
                .riskType(result.riskType())
                .intent(result.intent())
                .severity(result.severity())
                .reason(result.reason())
                .messageHash(hash(message))
                .pageContext(pageContext)
                .build()
        );
    }

    @Override
    public Page<AiSafetyLogResponse> listSafetyLogs(
            String decision,
            Pageable pageable
    ) {
        return null;
    }

    private String hash(String value) {
        if (value == null) return null;
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(digest.digest(
                    value.getBytes(StandardCharsets.UTF_8)
            ));
        } catch (NoSuchAlgorithmException ex) {
            return Integer.toHexString(value.hashCode());
        }
    }
}
