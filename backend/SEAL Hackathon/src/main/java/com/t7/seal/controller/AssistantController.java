package com.t7.seal.controller;

import com.t7.seal.config.ApiPaths;
import com.t7.seal.request.assistant.AssistantChatRequest;
import com.t7.seal.response.assistant.AssistantChatResponse;
import com.t7.seal.response.assistant.AssistantContextResponse;
import com.t7.seal.response.assistant.AssistantConversationResponse;
import com.t7.seal.response.assistant.AssistantMessageResponse;
import com.t7.seal.service.AssistantService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping(ApiPaths.API_V1 + "/assistant")
@Tag(
        name = "AI Assistant",
        description = "Role-aware bilingual assistant conversations and RAG responses."
)
public class AssistantController {

    private final AssistantService assistantService;

    @GetMapping("/context")
    public ResponseEntity<AssistantContextResponse> getContext(Authentication authentication) {
        return ResponseEntity.ok(assistantService.getContext(authentication));
    }

    @PostMapping("/chat")
    public ResponseEntity<AssistantChatResponse> chat(
            @Valid @RequestBody AssistantChatRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(assistantService.chat(request, authentication));
    }

    @GetMapping("/conversations")
    public ResponseEntity<List<AssistantConversationResponse>> listConversations(Authentication authentication) {
        return ResponseEntity.ok(assistantService.listConversations(authentication));
    }

    @GetMapping("/conversations/{conversationId}/messages")
    public ResponseEntity<List<AssistantMessageResponse>> getConversationMessages(
            @PathVariable UUID conversationId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(assistantService.getConversationMessages(conversationId, authentication));
    }
}
