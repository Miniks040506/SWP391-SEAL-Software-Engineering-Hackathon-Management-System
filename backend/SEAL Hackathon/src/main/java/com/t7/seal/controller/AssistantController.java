package com.t7.seal.controller;

import com.t7.seal.config.ApiPaths;
import com.t7.seal.request.assistant.AssistantChatRequest;
import com.t7.seal.response.ApiErrorResponse;
import com.t7.seal.response.assistant.AssistantChatResponse;
import com.t7.seal.response.assistant.AssistantContextResponse;
import com.t7.seal.response.assistant.AssistantConversationResponse;
import com.t7.seal.response.assistant.AssistantMessageResponse;
import com.t7.seal.service.AssistantService;
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

    @Operation(
            summary = "Get Context",
            description = "Get Context through GET /api/v1/assistant/context. Successful execution returns HTTP 200 with AssistantContextResponse. Access: Authenticated via SecurityConfig matcher anyRequest().",
            operationId = "assistantGetContext",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Get context completed successfully.",
                    useReturnTypeSchema = true
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Authentication is required or the access token is invalid.",
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
    @GetMapping("/context")
    public ResponseEntity<AssistantContextResponse> getContext(@Parameter(hidden = true) Authentication authentication) {
        return ResponseEntity.ok(assistantService.getContext(authentication));
    }

    @Operation(
            summary = "Chat",
            description = "Chat through POST /api/v1/assistant/chat. Successful execution returns HTTP 200 with AssistantChatResponse. Access: Authenticated via SecurityConfig matcher anyRequest(). Requires an AssistantChatRequest request body validated with Jakarta Bean Validation.",
            operationId = "assistantChat",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Chat completed successfully.",
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
    @PostMapping("/chat")
    public ResponseEntity<AssistantChatResponse> chat(
            @Valid @RequestBody AssistantChatRequest request,
            @Parameter(hidden = true) Authentication authentication
    ) {
        return ResponseEntity.ok(assistantService.chat(request, authentication));
    }


    @Operation(
            summary = "List Conversations",
            description = "List Conversations through GET /api/v1/assistant/conversations. Successful execution returns HTTP 200 with List<AssistantConversationResponse>. Access: Authenticated via SecurityConfig matcher anyRequest().",
            operationId = "assistantListConversations",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "List conversations completed successfully.",
                    useReturnTypeSchema = true
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Authentication is required or the access token is invalid.",
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
    @GetMapping("/conversations")
    public ResponseEntity<List<AssistantConversationResponse>> listConversations(
            @Parameter(hidden = true) Authentication authentication
    ) {
        return ResponseEntity.ok(assistantService.listConversations(authentication));
    }

    @Operation(
            summary = "Get Conversation Messages",
            description = "Get Conversation Messages through GET /api/v1/assistant/conversations/{conversationId}/messages. Successful execution returns HTTP 200 with List<AssistantMessageResponse>. Access: Authenticated via SecurityConfig matcher anyRequest().",
            operationId = "assistantGetConversationMessages",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Get conversation messages completed successfully.",
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
                    responseCode = "404",
                    description = "The requested resource or action token was not found.",
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
    @GetMapping("/conversations/{conversationId}/messages")
    public ResponseEntity<List<AssistantMessageResponse>> getConversationMessages(
            @Parameter(description = "Conversation Id value.", required = true)
            @PathVariable UUID conversationId,
            @Parameter(hidden = true) Authentication authentication
    ) {
        return ResponseEntity.ok(assistantService.getConversationMessages(conversationId, authentication));
    }
}
