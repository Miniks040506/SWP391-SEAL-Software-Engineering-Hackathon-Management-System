package com.t7.seal.controller;

import com.t7.seal.config.ApiPaths;
import com.t7.seal.entities.User;
import com.t7.seal.request.assistant.CreateKnowledgeDocumentRequest;
import com.t7.seal.response.ApiErrorResponse;
import com.t7.seal.response.PageResponse;
import com.t7.seal.config.AiProviderProperties;
import com.t7.seal.response.assistant.AiReindexResponse;
import com.t7.seal.response.assistant.AiSafetyLogResponse;
import com.t7.seal.response.assistant.KnowledgeDocumentResponse;
import com.t7.seal.service.AiKnowledgeService;
import com.t7.seal.service.AiSafetyLogService;
import com.t7.seal.service.CurrentUserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
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
    @Operation(
            summary = "List Knowledge",
            description = "List Knowledge through GET /api/v1/admin/assistant/knowledge. Successful execution returns HTTP 200 with List<KnowledgeDocumentResponse>. Access: Authenticated via SecurityConfig matcher anyRequest(); @PreAuthorize(\"hasRole('ADMIN')\").",
            operationId = "aiAdminListKnowledge",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "List knowledge completed successfully.",
                    useReturnTypeSchema = true
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Authentication is required or the access token is invalid.",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            ),
            @ApiResponse(
                    responseCode = "403",
                    description = "The authenticated user does not satisfy the required authorization policy.",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            ),
            @ApiResponse(
                    responseCode = "502",
                    description = "The external AI or embedding provider failed.",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "An unexpected server error occurred.",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            )
    })
    @GetMapping("/knowledge")
    public ResponseEntity<List<KnowledgeDocumentResponse>> listKnowledge() {
        return ResponseEntity.ok(aiKnowledgeService.listDocuments());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @Operation(
            summary = "Create Knowledge",
            description = "Create Knowledge through POST /api/v1/admin/assistant/knowledge. Successful execution returns HTTP 200 with KnowledgeDocumentResponse. Access: Authenticated via SecurityConfig matcher anyRequest(); @PreAuthorize(\"hasRole('ADMIN')\"). Requires a CreateKnowledgeDocumentRequest request body validated with Jakarta Bean Validation.",
            operationId = "aiAdminCreateKnowledge",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Create knowledge completed successfully.",
                    useReturnTypeSchema = true
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Request syntax, parameter conversion, or validation failed.",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Authentication is required or the access token is invalid.",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            ),
            @ApiResponse(
                    responseCode = "403",
                    description = "The authenticated user does not satisfy the required authorization policy.",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            ),
            @ApiResponse(
                    responseCode = "409",
                    description = "The operation conflicts with the current resource or workflow state.",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            ),
            @ApiResponse(
                    responseCode = "502",
                    description = "The external AI or embedding provider failed.",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "An unexpected server error occurred.",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            )
    })
    @PostMapping("/knowledge")
    public ResponseEntity<KnowledgeDocumentResponse> createKnowledge(
            @Valid @RequestBody CreateKnowledgeDocumentRequest request,
            @Parameter(hidden = true) Authentication authentication
    ) {
        User actor = currentUserService.getCurrentUser(authentication);
        return ResponseEntity.ok(aiKnowledgeService.createDocument(request, actor));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @Operation(
            summary = "Seed Knowledge",
            description = "Seed Knowledge through POST /api/v1/admin/assistant/knowledge/seed. Successful execution returns HTTP 204 without a response body. Access: Authenticated via SecurityConfig matcher anyRequest(); @PreAuthorize(\"hasRole('ADMIN')\").",
            operationId = "aiAdminSeedKnowledge",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Seed knowledge completed successfully with no response body."),
            @ApiResponse(
                    responseCode = "401",
                    description = "Authentication is required or the access token is invalid.",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            ),
            @ApiResponse(
                    responseCode = "403",
                    description = "The authenticated user does not satisfy the required authorization policy.",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            ),
            @ApiResponse(
                    responseCode = "409",
                    description = "The operation conflicts with the current resource or workflow state.",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            ),
            @ApiResponse(
                    responseCode = "502",
                    description = "The external AI or embedding provider failed.",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "An unexpected server error occurred.",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            )
    })
    @PostMapping("/knowledge/seed")
    public ResponseEntity<Void> seedKnowledge(@Parameter(hidden = true) Authentication authentication) {
        User actor = currentUserService.getCurrentUser(authentication);
        aiKnowledgeService.seedDefaultKnowledge(actor);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @Operation(
            summary = "Reindex Knowledge",
            description = "Reindex Knowledge through POST /api/v1/admin/assistant/knowledge/reindex. Successful execution returns HTTP 200 with AiReindexResponse. Access: Authenticated via SecurityConfig matcher anyRequest(); @PreAuthorize(\"hasRole('ADMIN')\").",
            operationId = "aiAdminReindexKnowledge",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Reindex knowledge completed successfully.",
                    useReturnTypeSchema = true
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Authentication is required or the access token is invalid.",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            ),
            @ApiResponse(
                    responseCode = "403",
                    description = "The authenticated user does not satisfy the required authorization policy.",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            ),
            @ApiResponse(
                    responseCode = "409",
                    description = "The operation conflicts with the current resource or workflow state.",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            ),
            @ApiResponse(
                    responseCode = "502",
                    description = "The external AI or embedding provider failed.",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "An unexpected server error occurred.",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            )
    })
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
    @Operation(
            summary = "List Safety Logs",
            description = "List Safety Logs through GET /api/v1/admin/assistant/safety-logs. Successful execution returns HTTP 200 with PageResponse<AiSafetyLogResponse>. Access: Authenticated via SecurityConfig matcher anyRequest(); @PreAuthorize(\"hasRole('ADMIN')\").",
            operationId = "aiAdminListSafetyLogs",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "List safety logs completed successfully.",
                    useReturnTypeSchema = true
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Request syntax, parameter conversion, or validation failed.",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Authentication is required or the access token is invalid.",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            ),
            @ApiResponse(
                    responseCode = "403",
                    description = "The authenticated user does not satisfy the required authorization policy.",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            ),
            @ApiResponse(
                    responseCode = "502",
                    description = "The external AI or embedding provider failed.",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "An unexpected server error occurred.",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            )
    })
    @GetMapping("/safety-logs")
    public ResponseEntity<PageResponse<AiSafetyLogResponse>> listSafetyLogs(
            @Parameter(description = "Decision value. (optional)", required = false)
            @RequestParam(required = false) String decision,
            @Parameter(description = "Zero-based result page index. (default: 0, optional)", required = false)
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Maximum number of items returned in one page. (default: 20, optional)", required = false)
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
