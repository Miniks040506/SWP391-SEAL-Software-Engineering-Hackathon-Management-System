package com.t7.seal.service.impl;

import com.t7.seal.config.AiProviderProperties;
import com.t7.seal.domain.AiLanguage;
import com.t7.seal.entities.User;
import com.t7.seal.exception.BadRequestException;
import com.t7.seal.exception.ForbiddenException;
import com.t7.seal.repository.AiConversationRepository;
import com.t7.seal.repository.AiMessageRepository;
import com.t7.seal.repository.RoundJudgeAssignmentRepository;
import com.t7.seal.repository.TeamRepository;
import com.t7.seal.request.assistant.AssistantChatRequest;
import com.t7.seal.response.assistant.AssistantChatResponse;
import com.t7.seal.response.assistant.AssistantContextResponse;
import com.t7.seal.response.assistant.AssistantConversationResponse;
import com.t7.seal.response.assistant.AssistantMessageResponse;
import com.t7.seal.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AssistantServiceImpl implements AssistantService {

    private final AiProviderProperties aiProviderProperties;

    private final CurrentUserService currentUserService;
    private final SystemConfigService systemConfigService;
    private final AiKnowledgeService aiKnowledgeService;
    private final AiProviderService aiProviderService;
    private final AiGuardrailService aiGuardrailService;
    private final AiSafetyLogService aiSafetyLogService;

    private final TeamRepository teamRepository;
    private final RoundJudgeAssignmentRepository roundJudgeAssignmentRepository;
    private final AiConversationRepository aiConversationRepository;
    private final AiMessageRepository aiMessageRepository;

    @Override
    @Transactional
    public AssistantChatResponse chat(
            AssistantChatRequest request,
            Authentication authentication
    ) {
        User user = currentUserService.getCurrentUser(authentication);
        ensureAssistantEnabled();
        if (request == null || request.message() == null || request.message().isBlank()) {
            throw new BadRequestException("Assistant message is required.");
        }

        AiLanguage language = detectLanguage(request.message(), request.preferredLanguage());

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

    //HELPERS

    private AiLanguage detectLanguage(String message, String preferred) {
        if (notBlank(preferred)) {
            try {
                return AiLanguage.valueOf(
                        preferred.trim().toUpperCase(Locale.ROOT)
                );
            } catch (IllegalArgumentException ignored) {
                ignored.printStackTrace();
            }
        }

        String lower = safe(message).toLowerCase(Locale.ROOT);
        boolean vi = lower.matches(".*[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ].*")
                || containsAny(lower, "tôi", "mình", "không", "đội", "nộp", "chấm", "điểm", "dịch", "lỗi");
        boolean en = containsAny(
                lower,
                "how", "what", "where", "when", "explain",
                "translate", "submit", "team", "score", "error"
        );

        if (vi && en) return AiLanguage.MIXED;
        if (vi) return AiLanguage.VI;
        if (en) return AiLanguage.EN;

        return AiLanguage.UNKNOWN;
    }

    private void ensureAssistantEnabled() {
        if (!systemConfigService.getBooleanValue(
                "feature.ai_assistant.enabled",
                true
        )) {
            throw new ForbiddenException("AI assistant is currently disabled by SystemConfig.");
        }
    }


    private boolean notBlank(String value) {
        return value != null && !value.isBlank();
    }

    private String safe(String value) {
        return value == null ? "" : value;
    }

    private int parseInt(String value, int fallback) {
        try {
            return Integer.parseInt(value);
        } catch (Exception ignored) {
            return fallback;
        }
    }

    private String contextsAsText(List<String> contexts) {
        return contexts == null ? null : String.join("\n---\n", contexts);
    }

    private boolean containsAny(String lower, String... needles) {
        for (String needle : needles) {
            if (lower.contains(needle)) {
                return true;
            }
        }
        return false;
    }
}
