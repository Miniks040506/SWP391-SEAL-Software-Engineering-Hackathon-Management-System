package com.t7.seal.controller;

import com.t7.seal.config.ApiPaths;
import com.t7.seal.entities.User;
import com.t7.seal.request.assistant.CreateKnowledgeDocumentRequest;
import com.t7.seal.response.PageResponse;
import com.t7.seal.config.AiProviderProperties;
import com.t7.seal.response.assistant.AiReindexResponse;
import com.t7.seal.response.assistant.AiSafetyLogResponse;
import com.t7.seal.response.assistant.KnowledgeDocumentResponse;
import com.t7.seal.service.AiKnowledgeService;
import com.t7.seal.service.AiSafetyLogService;
import com.t7.seal.service.CurrentUserService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping(ApiPaths.API_V1 + "/admin/assistant")
@Tag(
        name = "AI Administration",
        description = "Manage AI knowledge, embeddings, and safety logs."
)
public class AiAdminController {

    private final AiKnowledgeService aiKnowledgeService;
    private final AiSafetyLogService aiSafetyLogService;
    private final CurrentUserService currentUserService;
    private final AiProviderProperties aiProviderProperties;

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/knowledge")
    public ResponseEntity<List<KnowledgeDocumentResponse>> listKnowledge() {
        return ResponseEntity.ok(aiKnowledgeService.listDocuments());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/knowledge")
    public ResponseEntity<KnowledgeDocumentResponse> createKnowledge(
            @Valid @RequestBody CreateKnowledgeDocumentRequest request,
            Authentication authentication
    ) {
        User actor = currentUserService.getCurrentUser(authentication);
        return ResponseEntity.ok(aiKnowledgeService.createDocument(request, actor));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/knowledge/seed")
    public ResponseEntity<Void> seedKnowledge(Authentication authentication) {
        User actor = currentUserService.getCurrentUser(authentication);
        aiKnowledgeService.seedDefaultKnowledge(actor);
        return ResponseEntity.noContent().build();
    }


    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/knowledge/reindex")
    public ResponseEntity<AiReindexResponse> reindexKnowledge() {
        int indexed = aiKnowledgeService.reindexKnowledge();
        return ResponseEntity.ok(new AiReindexResponse(
                indexed,
                aiProviderProperties.getEmbedding().getModel(),
                aiProviderProperties.getEmbedding().getDimension(),
                LocalDateTime.now()
        ));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/safety-logs")
    public ResponseEntity<PageResponse<AiSafetyLogResponse>> listSafetyLogs(
            @RequestParam(required = false) String decision,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(Math.max(0, page), Math.max(1, size), Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<AiSafetyLogResponse> result = aiSafetyLogService.listSafetyLogs(decision, pageable);
        return ResponseEntity.ok(new PageResponse<>(
                result.getContent(),
                result.getNumber(),
                result.getSize(),
                result.getTotalElements(),
                result.getTotalPages(),
                result.isLast()
        ));
    }
}
