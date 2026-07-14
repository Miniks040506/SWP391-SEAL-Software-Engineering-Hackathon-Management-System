package com.t7.seal.request.assistant;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

@Schema(name = "CreateKnowledgeDocumentRequest", description = "Request payload for create knowledge document.")
public record CreateKnowledgeDocumentRequest(
        @Schema(
                description = "Human-readable title.",
                example = "Submission deadline reminder",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotBlank String title,
        @Schema(
                description = "Business content or page content collection, depending on the DTO.",
                example = "content example",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotBlank String content,
        @Schema(
                description = "Client-supplied value for doc type.",
                example = "GENERAL"
        )
        String docType,
        @Schema(
                description = "Client-supplied value for source ref.",
                example = "source ref example"
        )
        String sourceRef,
        @Schema(
                description = "Client-supplied value for visibility.",
                example = "STAFF_ONLY"
        )
        String visibility,
        @Schema(
                description = "Client-supplied value for module.",
                example = "module example"
        )
        String module,
        @Schema(
                description = "UUID reference to the use case.",
                example = "use case id example"
        )
        String useCaseId,
        @Schema(
                description = "Client-supplied value for role scope.",
                example = "role scope example"
        )
        String roleScope
) {}

