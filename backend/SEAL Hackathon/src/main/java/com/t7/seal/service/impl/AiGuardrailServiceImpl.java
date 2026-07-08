package com.t7.seal.service.impl;

import com.t7.seal.domain.AiIntent;
import com.t7.seal.domain.AiSafetyDecision;
import com.t7.seal.domain.AiSafetyRiskType;
import com.t7.seal.domain.UserRole;
import com.t7.seal.dto.ai.AiGuardrailResult;
import com.t7.seal.entities.User;
import com.t7.seal.request.assistant.AssistantChatRequest;
import com.t7.seal.service.AiGuardrailService;
import com.t7.seal.service.SystemConfigService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Locale;

@Service
@RequiredArgsConstructor
public class AiGuardrailServiceImpl implements AiGuardrailService {

    private final SystemConfigService systemConfigService;

    @Override
    public AiGuardrailResult evaluateInput(AssistantChatRequest request, User user) {
        boolean enabled = systemConfigService.getBooleanValue(
                "feature.ai_assistant.academic_guardrails.enabled",
                true
        );

        if (!enabled) {
            return AiGuardrailResult.allow(detectIntent(
                    request == null ? null : request.message(),
                    request == null ? null : request.attachmentText())
            );
        }

        String message = normalize(join(
                request == null ? null : request.message(),
                request == null ? null : request.attachmentText(),
                request == null ? null : request.attachmentFileName())
        );
        AiIntent intent = detectIntent(
                request == null ? null : request.message(),
                request == null ? null : request.attachmentText());

        if (containsAny(message,
                "ignore previous", "ignore all previous",
                "bỏ qua hướng dẫn", "bỏ qua policy", "system prompt", "developer message")
        ) {
            return block(
                    AiSafetyRiskType.PROMPT_INJECTION,
                    intent,
                    8,
                    "Prompt injection attempt detected.",
                    safePolicyAnswer(user)
            );
        }
        if (containsAny(message,
                "bypass plagiarism", "qua đạo văn", "tránh bị phát hiện ai",
                "hide ai generated", "ẩn ai generated", "copy solution", "cheat", "gian lận")
        ) {
            return block(
                    AiSafetyRiskType.PLAGIARISM_BYPASS,
                    AiIntent.BLOCK_PLAGIARISM_BYPASS,
                    10,
                    "The request asks for plagiarism, cheating, or detection bypass.",
                    safePolicyAnswer(user)
            );
        }
        if (containsAny(message,
                "điểm của đội khác", "submission của đội khác",
                "raw score của đội khác", "private data", "export all private",
                "show other team's score")
        ) {
            return block(
                    AiSafetyRiskType.PRIVATE_DATA,
                    AiIntent.BLOCK_PRIVATE_DATA,
                    9,
                    "The request may expose private data outside the user's authorization scope.",
                    "Mình không thể cung cấp dữ liệu riêng tư hoặc dữ liệu " +
                            "ngoài quyền truy cập của bạn. Mình có thể hướng dẫn bạn " +
                            "xem dữ liệu hợp lệ trong SEAL theo đúng role."
            );
        }

        boolean student = user != null && user.getRole() == UserRole.STUDENT;
        boolean strictForAll = systemConfigService.getBooleanValue(
                "ai.guardrail.strict_for_all_roles",
                true
        );
        boolean applyAcademicGuardrail = student || strictForAll;

        if (applyAcademicGuardrail && asksForAssignmentSolution(message)) {
            return block(
                    AiSafetyRiskType.ASSIGNMENT_CODE,
                    AiIntent.BLOCK_ASSIGNMENT_CODE,
                    10,
                    "User asks the assistant to transform an assignment/project prompt," +
                            " screenshot, or file into implementation code.",
                    safePolicyAnswer(user)
            );
        }
        if (applyAcademicGuardrail && asksForFullCode(message)) {
            return block(
                    AiSafetyRiskType.FULL_SOLUTION,
                    AiIntent.BLOCK_FULL_SOLUTION,
                    9,
                    "User asks for a complete implementation or full code deliverable.",
                    safePolicyAnswer(user)
            );
        }

        if (containsAny(
                message, "football", "world cup", "movie", "đặt đồ ăn", "du lịch"
        ) && !containsAny(
                message,
                "seal", "project", "spring", "react", "api", "jwt", "database")
        ) {
            boolean restrictScope = systemConfigService.getBooleanValue(
                    "ai.assistant.restrict_to_project_scope",
                    true
            );
            if (restrictScope) {
                return block(
                        AiSafetyRiskType.OUT_OF_SCOPE,
                        AiIntent.OUT_OF_SCOPE,
                        4,
                        "The request is outside SEAL/project/technology support scope.",
                        "Mình chỉ hỗ trợ các vấn đề liên quan SEAL, " +
                                "quy trình hackathon, hoặc công nghệ phục vụ project. " +
                                "Bạn có thể hỏi về team, submission, grading, ranking, " +
                                "Spring Boot, React, database, security hoặc deployment."
                );
            }
        }
        return AiGuardrailResult.allow(intent);
    }

    @Override
    public AiGuardrailResult evaluateOutput(String answer, User user) {
        return null;
    }

    //HELPERS

    private AiIntent detectIntent(String message, String attachmentText) {
        String lower = normalize(join(message, attachmentText));

        if (containsAny(
                lower, "dịch", "translate", "translation", "english", "vietnamese")
        ) {
            return AiIntent.TRANSLATION;
        }
        if (containsAny(
                lower, "submit", "submission", "nộp", "deliverable", "repo", "demo")
        ) {
            return AiIntent.SUBMISSION_HELP;
        }
        if (containsAny(
                lower, "team", "invite", "join", "đội", "mời", "tham gia")
        ) {
            return AiIntent.TEAM_HELP;
        }
        if (containsAny(
                lower, "score", "grade", "judge", "chấm", "điểm", "criteria", "rubric")
        ) {
            return AiIntent.GRADING_HELP;
        }
        if (containsAny(
                lower, "ranking", "leaderboard", "result", "award",
                "prize", "xếp hạng", "kết quả", "giải")
        ) {
            return AiIntent.RESULT_HELP;
        }
        if (containsAny(
                lower, "deadline", "reminder", "nhắc", "hạn", "calendar")
        ) {
            return AiIntent.REMINDER_HELP;
        }
        if (containsAny(
                lower, "role", "permission", "access", "quyền", "không vào được")
        ) {
            return AiIntent.ACCESS_HELP;
        }
        if (containsAny(
                lower, "bug", "error", "exception", "lỗi", "stack trace", "debug")
        ) {
            return AiIntent.DEBUG_GUIDANCE;
        }
        if (containsAny(
                lower, "spring", "react", "jpa", "jwt", "oauth",
                "postgres", "docker", "deploy", "api")
        ) {
            return AiIntent.TECH_EXPLANATION;
        }

        return AiIntent.GENERAL_HELP;
    }

    private AiGuardrailResult block(
            AiSafetyRiskType riskType,
            AiIntent intent,
            int severity,
            String reason,
            String safeAnswer
    ) {
        return new AiGuardrailResult(
                AiSafetyDecision.BLOCK,
                riskType,
                intent,
                severity,
                reason,
                safeAnswer
        );
    }

    private String safePolicyAnswer(User user) {
        return "Mình không thể viết full code, làm bài nộp, " +
                "hoặc biến đề bài/file/hình đề bài thành solution cho team. "
                + "Mình có thể hỗ trợ theo hướng an toàn: " +
                "giải thích yêu cầu, chia nhỏ task, gợi ý kiến thức cần học, " +
                "lập checklist, viết pseudocode ngắn, " +
                "hoặc review/debug phần code bạn đã tự viết.";
    }

    private String normalize(String value) {
        return value == null ? "" : value.toLowerCase(Locale.ROOT).trim();
    }

    private String join(String... values) {
        StringBuilder builder = new StringBuilder();
        if (values == null) return "";
        for (String value : values) {
            if (value != null && !value.isBlank()) builder.append(value).append(' ');
        }
        return builder.toString();
    }

    private int count(String haystack, String needle) {
        if (haystack == null || needle == null || needle.isEmpty()) return 0;
        int count = 0;
        int index = 0;
        while ((index = haystack.indexOf(needle, index)) >= 0) {
            count++;
            index += needle.length();
        }
        return count;
    }

    private boolean containsAny(String lower, String... needles) {
        for (String needle : needles) {
            if (lower.contains(needle)) return true;
        }
        return false;
    }
}
