package com.t7.seal.service.impl;

import com.t7.seal.domain.AiIntent;
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

        return null;
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
