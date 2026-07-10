package com.t7.seal.service.impl;

import com.t7.seal.config.AiProviderProperties;
import com.t7.seal.domain.*;
import com.t7.seal.dto.ai.AiGuardrailResult;
import com.t7.seal.entities.AiConversation;
import com.t7.seal.entities.AiMessage;
import com.t7.seal.entities.User;
import com.t7.seal.exception.BadRequestException;
import com.t7.seal.exception.ForbiddenException;
import com.t7.seal.exception.NotFoundException;
import com.t7.seal.repository.AiConversationRepository;
import com.t7.seal.repository.AiMessageRepository;
import com.t7.seal.repository.RoundJudgeAssignmentRepository;
import com.t7.seal.repository.TeamRepository;
import com.t7.seal.request.assistant.AssistantChatRequest;
import com.t7.seal.response.assistant.*;
import com.t7.seal.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

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
        Map<String, Object> roleContext = buildRoleContext(user);
        AiConversation conversation = resolveConversation(request, user, language);
        AiGuardrailResult inputGuardrail = aiGuardrailService.evaluateInput(request, user);
        persistUserMessage(conversation, user, request, language, inputGuardrail);

        if (inputGuardrail.blocked()) {
            persistAssistantMessage(
                    conversation,
                    inputGuardrail.safeAnswer(),
                    language,
                    inputGuardrail.intent(),
                    inputGuardrail.decision(),
                    "GUARDRAIL",
                    null,
                    false,
                    null
            );
            return assistantChatResponse(
                    conversation,
                    inputGuardrail.safeAnswer(),
                    inputGuardrail,
                    language,
                    false,
                    false,
                    "GUARDRAIL",
                    null,
                    List.of(),
                    roleContext
            );
        }

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

    private AssistantChatResponse assistantChatResponse(
            AiConversation conversation,
            String answer,
            AiGuardrailResult guardrail,
            AiLanguage language,
            boolean ragEnabled,
            boolean usedRag,
            String provider,
            String model,
            List<AssistantSourceResponse> sources,
            Map<String, Object> roleContext
    ) {
        return new AssistantChatResponse(
                conversation.getId(),
                answer,
                guardrail.intent() == null ? null : guardrail.intent().name(),
                language.name(),
                guardrail.blocked(),
                guardrail.reason(),
                guardrail.decision() == null ? null : guardrail.decision().name(),
                guardrail.riskType() == null ? null : guardrail.riskType().name(),
                guardrail.severity(),
                ragEnabled,
                usedRag,
                provider,
                model,
                suggestionsFor(roleContext, guardrail.intent(), guardrail.blocked()),
                sources,
                roleContext,
                LocalDateTime.now()
        );
    }

    private AiConversation resolveConversation(
            AssistantChatRequest request,
            User user,
            AiLanguage language
    ) {
        if (request.conversationId() != null) {
            return aiConversationRepository.findByIdAndUserId(request.conversationId(), user.getId())
                    .orElseThrow(() ->
                            new NotFoundException("Assistant conversation not found."));
        }

        String title = request.message().trim();
        if (title.length() > 80) {
            title = title.substring(0, 77) + "...";
        }

        return aiConversationRepository.save(AiConversation.builder()
                .user(user)
                .title(title)
                .language(language)
                .isActive(true)
                .build());
    }

    private void persistUserMessage(
            AiConversation conversation,
            User user,
            AssistantChatRequest request,
            AiLanguage language,
            AiGuardrailResult guardrail
    ) {
        String content = request.message();
        if (notBlank(request.attachmentText())) {
            content += "\n\n[Attachment: " +
                    safe(request.attachmentFileName()) + "]\n" +
                    request.attachmentText();
        }

        aiMessageRepository.save(AiMessage.builder()
                .conversation(conversation)
                .user(user)
                .role(AiMessageRole.USER)
                .content(content)
                .language(language)
                .intent(guardrail.intent())
                .safetyDecision(guardrail.decision())
                .build());

        conversation.setLastIntent(guardrail.intent() == null
                ? null : guardrail.intent().name());

        aiConversationRepository.save(conversation);
    }

    private void persistAssistantMessage(
            AiConversation conversation,
            String answer,
            AiLanguage language,
            AiIntent intent,
            AiSafetyDecision decision,
            String provider,
            String model,
            boolean usedRag,
            String retrievalContext
    ) {
        aiMessageRepository.save(AiMessage.builder()
                .conversation(conversation)
                .role(AiMessageRole.ASSISTANT)
                .content(answer)
                .language(language)
                .intent(intent)
                .safetyDecision(decision)
                .provider(provider)
                .model(model)
                .usedRag(usedRag)
                .retrievalContext(retrievalContext)
                .build());

        conversation.setLastIntent(intent == null ? null : intent.name());

        aiConversationRepository.save(conversation);
    }

    private Map<String, Object> buildRoleContext(User user) {
        Map<String, Object> ctx = new LinkedHashMap<>();

        ctx.put("role", user.getRole() == null ? null : user.getRole().name());
        ctx.put("status", user.getStatus() == null ? null : user.getStatus().name());
        ctx.put("assistantMode", aiProviderProperties.getProvider());
        ctx.put("chatModel", aiProviderProperties.getChat().getModel());
        ctx.put("embeddingModel", aiProviderProperties.getEmbedding().getModel());

        ctx.put("ragEnabled", systemConfigService.getBooleanValue(
                "feature.ai_assistant.rag.enabled",
                true
        ));
        ctx.put("guardrailsEnabled", systemConfigService.getBooleanValue(
                "feature.ai_assistant.academic_guardrails.enabled",
                true
        ));

        if (user.getRole() == UserRole.STUDENT) {
            ctx.put("activeTeamCount", teamRepository
                    .findActiveTeamByUserId(user.getId()).size());
            ctx.put("safeTools", List.of(
                    "getMyTeams",
                    "getMySubmissions",
                    "getMyInvitations"
            ));
        }

        if (user.getRole() == UserRole.JUDGE && user.getJudge() != null) {
            ctx.put("judgeAssignmentCount", roundJudgeAssignmentRepository
                    .findByJudgeIdWithRoundAndTrack(user.getJudge().getId()).size());
            ctx.put("judgeType", user.getJudge().getJudgeType() == null
                    ? null : user.getJudge().getJudgeType().name());
            ctx.put("safeTools", List.of(
                    "getJudgeAssignedSubmissions",
                    "getJudgeProgress"
            ));
        }

        if (user.getRole() == UserRole.ADMIN) {
            ctx.put("adminTools", List.of(
                    "SystemConfig",
                    "AI Knowledge",
                    "AI Safety Logs",
                    "AuditLog",
                    "Exports",
                    "Feature flags"
            ));
        }

        if (user.getRole() == UserRole.COORDINATOR) {
            ctx.put("coordinatorTools", List.of(
                    "Events",
                    "Rounds",
                    "Grading",
                    "Ranking",
                    "Reminders",
                    "Exports",
                    "Disqualification"
            ));
        }

        return ctx;
    }

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

    private List<String> suggestionsFor(
            Map<String, Object> roleContext,
            AiIntent intent,
            boolean blocked
    ) {
        if (blocked) {
            return List.of(
                    "Explain the requirement safely",
                    "Create a task checklist",
                    "Review my own code",
                    "Explain the concept"
            );
        }

        if (intent == AiIntent.TRANSLATION) {
            return List.of(
                    "Translate to Vietnamese",
                    "Translate to English",
                    "Keep technical terms in English"
            );
        }

        if (intent == AiIntent.TECH_EXPLANATION
                || intent == AiIntent.DEBUG_GUIDANCE) {
            return List.of(
                    "Explain root cause",
                    "Suggest debug checklist",
                    "Show safe pseudocode",
                    "List files to inspect"
            );
        }

        return List.of(
                "Show related SEAL flow",
                "Explain by role",
                "Create checklist",
                "Show sources"
        );
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
