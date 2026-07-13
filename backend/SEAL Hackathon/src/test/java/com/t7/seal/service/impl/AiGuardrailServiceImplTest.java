package com.t7.seal.service.impl;

import com.t7.seal.domain.UserRole;
import com.t7.seal.dto.ai.AiGuardrailResult;
import com.t7.seal.entities.User;
import com.t7.seal.request.assistant.AssistantChatRequest;
import com.t7.seal.service.SystemConfigService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AiGuardrailServiceImplTest {

    @Mock
    private SystemConfigService systemConfigService;

    private AiGuardrailServiceImpl guardrailService;
    private User student;

    @BeforeEach
    void setUp() {
        guardrailService = new AiGuardrailServiceImpl(systemConfigService);
        student = User.builder().role(UserRole.STUDENT).build();

        when(systemConfigService.getBooleanValue(
                "feature.ai_assistant.academic_guardrails.enabled",
                true
        )).thenReturn(true);
        when(systemConfigService.getBooleanValue(
                "ai.guardrail.strict_for_all_roles",
                true
        )).thenReturn(true);
    }

    @Test
    void allowsAssignmentExplanationWhenUserExplicitlyRejectsCode() {
        AiGuardrailResult result = guardrailService.evaluateInput(
                request("Explain this assignment's frontend requirements. Do not write code."),
                student
        );

        assertFalse(result.blocked());
    }

    @Test
    void stillBlocksAFullImplementationRequest() {
        AiGuardrailResult result = guardrailService.evaluateInput(
                request("This is my assignment. Write full backend code for the submission."),
                student
        );

        assertTrue(result.blocked());
    }

    @Test
    void safePhraseDoesNotOverrideAnExplicitFullCodeRequest() {
        AiGuardrailResult result = guardrailService.evaluateInput(
                request("Explain this assignment, but then write full frontend code. Do not write code comments."),
                student
        );

        assertTrue(result.blocked());
    }

    private AssistantChatRequest request(String message) {
        return new AssistantChatRequest(
                message,
                null,
                null,
                null,
                null,
                "/participant/teams",
                "EN",
                null,
                null,
                null,
                null
        );
    }
}
