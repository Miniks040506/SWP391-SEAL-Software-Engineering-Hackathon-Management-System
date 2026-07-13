package com.t7.seal.service.impl;

import com.t7.seal.config.AiProviderProperties;
import com.t7.seal.domain.*;
import com.t7.seal.dto.ai.AiGuardrailResult;
import com.t7.seal.dto.ai.AiProviderRequest;
import com.t7.seal.dto.ai.AiProviderResult;
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
            aiSafetyLogService.record(
                    user,
                    conversation,
                    inputGuardrail,
                    request.message() + " " + safe(request.attachmentText()),
                    request.pageContext()
            );
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

        AiIntent intent = inputGuardrail.intent() == null
                ? detectIntent(request.message(), request.attachmentText())
                : inputGuardrail.intent();
        boolean ragEnabled = systemConfigService.getBooleanValue("feature.ai_assistant.rag.enabled", true);
        int maxChunks = parseInt(systemConfigService.getStringValue("ai.rag.max_chunks", String.valueOf(aiProviderProperties.getRag().getMaxChunks())), aiProviderProperties.getRag().getMaxChunks());
        String query = request.message() + " " + safe(request.attachmentText());
        List<AssistantSourceResponse> sources = ragEnabled ? aiKnowledgeService.retrieve(query, user, maxChunks) : List.of();
        List<String> contexts = sources.stream().map(AssistantSourceResponse::excerpt).toList();

        boolean translationMode = intent == AiIntent.TRANSLATION
                || notBlank(request.translationTargetLanguage());
        String targetLanguage = notBlank(request.translationTargetLanguage())
                ? request.translationTargetLanguage()
                : (language == AiLanguage.VI ? "English" : "Vietnamese");
        AiProviderRequest providerRequest = new AiProviderRequest(
                systemPrompt(user, language, intent),
                buildUserMessage(request),
                language,
                contexts,
                translationMode,
                targetLanguage
        );

        AiProviderResult providerResult = aiProviderService.generate(providerRequest);
        AiGuardrailResult outputGuardrail = aiGuardrailService.evaluateOutput(
                providerResult.answer(),
                user
        );

        if (outputGuardrail.blocked()) {
            aiSafetyLogService.record(
                    user,
                    conversation,
                    outputGuardrail,
                    providerResult.answer(),
                    request.pageContext()
            );

            persistAssistantMessage(
                    conversation,
                    outputGuardrail.safeAnswer(),
                    language,
                    outputGuardrail.intent(),
                    outputGuardrail.decision(),
                    "POST_GUARDRAIL",
                    null,
                    !sources.isEmpty(),
                    contextsAsText(contexts)
            );

            return assistantChatResponse(
                    conversation,
                    outputGuardrail.safeAnswer(),
                    outputGuardrail,
                    language,
                    ragEnabled,
                    !sources.isEmpty(),
                    "POST_GUARDRAIL",
                    null,
                    sources,
                    roleContext
            );
        }

        persistAssistantMessage(
                conversation,
                providerResult.answer(),
                language,
                intent,
                AiSafetyDecision.ALLOW,
                providerResult.provider(),
                providerResult.model(),
                !sources.isEmpty(),
                contextsAsText(contexts)
        );
        AiGuardrailResult allowed = AiGuardrailResult.allow(intent);

        return assistantChatResponse(
                conversation,
                providerResult.answer(),
                allowed,
                language,
                ragEnabled,
                !sources.isEmpty(),
                providerResult.provider(),
                providerResult.model(),
                sources,
                roleContext
        );
    }

    @Override
    @Transactional(readOnly = true)
    public AssistantContextResponse getContext(Authentication authentication) {
        User user = currentUserService.getCurrentUser(authentication);
        ensureAssistantEnabled();
        return new AssistantContextResponse(
                user.getId(),
                user.getFullName(),
                user.getRole() == null ? null : user.getRole().name(),
                user.getStatus() == null ? null : user.getStatus().name(),
                quickPrompts(user.getRole()),
                buildRoleContext(user)
        );
    }

    @Override
    @Transactional(readOnly = true)
    public List<AssistantConversationResponse> listConversations(Authentication authentication) {
        User user = currentUserService.getCurrentUser(authentication);

        return aiConversationRepository
                .findTop20ByUserIdAndIsActiveTrueOrderByUpdatedAtDesc(user.getId())
                .stream()
                .map(this::toConversationResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<AssistantMessageResponse> getConversationMessages(
            UUID conversationId,
            Authentication authentication
    ) {
        User user = currentUserService.getCurrentUser(authentication);
        AiConversation conversation = aiConversationRepository
                .findByIdAndUserId(conversationId, user.getId())
                .orElseThrow(() ->
                        new NotFoundException("Assistant conversation not found."));

        List<AiMessage> messages = new ArrayList<>(aiMessageRepository
                .findTop50ByConversationIdOrderByCreatedAtDesc(conversation.getId()));
        Collections.reverse(messages);

        return messages
                .stream()
                .map(this::toMessageResponse)
                .toList();
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

    private String systemPrompt(
            User user,
            AiLanguage language,
            AiIntent intent
    ) {
        return "You are SEAL Assistant for the SEAL Hackathon Management System. " +
                "Answer in " + (language == AiLanguage.EN ? "English" : "Vietnamese") +
                " unless translation is requested. " +
                "Use retrieved SEAL context when provided. The current role is " +
                (user.getRole() == null ? "UNKNOWN" : user.getRole().name()) + ". " +
                "Hard rules: do not write full code, full project, " +
                "or team submission deliverables; " +
                "do not convert assignment prompts/screenshots/files into complete code; " +
                "do not bypass plagiarism/security; do not reveal unauthorized private data. " +
                "Allowed: explain concepts, outline safe steps, provide short pseudocode, " +
                "debug user-written code, create checklists, and translate Vietnamese/English.";
    }

    private String buildUserMessage(AssistantChatRequest request) {
        StringBuilder builder = new StringBuilder(request.message().trim());

        if (notBlank(request.pageContext())) {
            builder.append("\nPage context: ").append(request.pageContext());
        }
        if (notBlank(request.attachmentText())) {
            builder.append("\nAttachment file: ")
                    .append(safe(request.attachmentFileName()))
                    .append("\nExtracted attachment text:\n")
                    .append(request.attachmentText());
        }

        return builder.toString();
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

    private AiIntent detectIntent(String message, String attachmentText) {
        String lower = (safe(message) + " " + safe(attachmentText))
                .toLowerCase(Locale.ROOT);

        if (containsAny(lower, "dịch", "translate", "translation"))
            return AiIntent.TRANSLATION;

        if (containsAny(
                lower,
                "submit", "submission", "nộp", "deliverable", "repo", "demo"
        )) return AiIntent.SUBMISSION_HELP;

        if (containsAny(
                lower,
                "team", "invite", "join", "đội", "mời", "tham gia"
        )) return AiIntent.TEAM_HELP;

        if (containsAny(
                lower,
                "score", "grade", "judge", "chấm", "điểm", "criteria", "rubric"
        )) return AiIntent.GRADING_HELP;

        if (containsAny(
                lower,
                "ranking", "leaderboard", "result", "award",
                "prize", "xếp hạng", "kết quả", "giải"
        )) return AiIntent.RESULT_HELP;

        if (containsAny(
                lower,
                "deadline", "reminder", "nhắc", "hạn", "calendar"
        )) return AiIntent.REMINDER_HELP;

        if (containsAny(
                lower,
                "role", "permission", "access", "quyền", "không vào được"
        )) return AiIntent.ACCESS_HELP;

        if (containsAny(
                lower,
                "bug", "error", "exception", "lỗi", "stack trace", "debug"
        )) return AiIntent.DEBUG_GUIDANCE;

        if (containsAny(
                lower,
                "spring", "react", "jpa", "jwt", "oauth",
                "postgres", "docker", "deploy", "api"
        )) return AiIntent.TECH_EXPLANATION;

        return AiIntent.GENERAL_HELP;
    }

    private List<String> quickPrompts(UserRole role) {
        if (role == UserRole.STUDENT) {
            return List.of(
                    "Tôi cần nộp bài như thế nào?",
                    "Dịch hướng dẫn submission sang English",
                    "Giải thích lỗi API 403 ở mức debug",
                    "Team của tôi nên kiểm tra gì trước deadline?"
            );
        }

        if (role == UserRole.JUDGE) {
            return List.of(
                    "How do I score assigned submissions?",
                    "Explain calibration variance",
                    "What can I edit before final submit?"
            );
        }

        if (role == UserRole.COORDINATOR) {
            return List.of(
                    "How do I publish results safely?",
                    "Generate reminder flow checklist",
                    "Explain disqualification and ranking recalculation",
                    "How to export RBL dataset?"
            );
        }

        if (role == UserRole.ADMIN) {
            return List.of(
                    "How do I configure AI provider?",
                    "How do I seed AI knowledge?",
                    "Show guardrail policy summary",
                    "Explain SystemConfig secrets masking"
            );
        }

        return List.of(
                "How do I use SEAL?",
                "Translate this instruction",
                "Explain project workflow"
        );
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

    private AssistantConversationResponse toConversationResponse(
            AiConversation conversation
    ) {
        return new AssistantConversationResponse(
                conversation.getId(),
                conversation.getTitle(),
                conversation.getLanguage() == null
                        ? null : conversation.getLanguage().name(),
                conversation.getLastIntent(),
                conversation.getCreatedAt(),
                conversation.getUpdatedAt()
        );
    }

    private AssistantMessageResponse toMessageResponse(AiMessage message) {
        return new AssistantMessageResponse(
                message.getId(),
                message.getConversation().getId(),
                message.getRole() == null
                        ? null : message.getRole().name(),
                message.getContent(),
                message.getLanguage() == null
                        ? null : message.getLanguage().name(),
                message.getIntent() == null
                        ? null : message.getIntent().name(),
                message.getSafetyDecision() == null
                        ? null : message.getSafetyDecision().name(),
                message.getProvider(),
                message.getModel(),
                message.getUsedRag(),
                message.getCreatedAt()
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
