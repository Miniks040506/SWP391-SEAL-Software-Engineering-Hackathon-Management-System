package com.t7.seal.controller;

import com.t7.seal.config.ApiPaths;
import com.t7.seal.response.ApiErrorResponse;
import com.t7.seal.response.system.ExportDownloadResponse;
import com.t7.seal.response.system.ExportJobResponse;
import com.t7.seal.service.ExportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping(ApiPaths.API_V1 + "/export-jobs")
@Tag(
        name = "Export Jobs",
        description = "Compatibility endpoints for export status and downloads."
)
public class ExportJobController {

    private final ExportService exportService;

    @PreAuthorize("hasAnyRole('ADMIN', 'COORDINATOR')")
    @Operation(
            summary = "Get Export Job",
            description = "Get Export Job through GET /api/v1/export-jobs/{jobId}. Successful execution returns HTTP 200 with ExportJobResponse. Access: SecurityConfig roles ADMIN, COORDINATOR via matcher /api/v1/export-jobs/**; @PreAuthorize(\"hasAnyRole('ADMIN', 'COORDINATOR')\").",
            operationId = "exportJobGetExportJob",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Get export job completed successfully.",
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
                    responseCode = "404",
                    description = "The requested resource or action token was not found.",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "An unexpected server error occurred.",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            )
    })
    @GetMapping("/{jobId}")
    public ResponseEntity<ExportJobResponse> getExportJob(
            @Parameter(description = "Unique asynchronous job identifier.", required = true)
            @PathVariable UUID jobId,
            @Parameter(hidden = true) Authentication authentication
    ) {
        return ResponseEntity.ok(exportService.getExportJobById(jobId, authentication));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'COORDINATOR')")
    @Operation(
            summary = "Download Export",
            description = "Download Export through GET /api/v1/export-jobs/{jobId}/download. Successful execution returns HTTP 200 with ExportDownloadResponse. Access: SecurityConfig roles ADMIN, COORDINATOR via matcher /api/v1/export-jobs/**; @PreAuthorize(\"hasAnyRole('ADMIN', 'COORDINATOR')\").",
            operationId = "exportJobDownloadExport",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Download export completed successfully.",
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
                    responseCode = "404",
                    description = "The requested resource or action token was not found.",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "An unexpected server error occurred.",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            )
    })
    @GetMapping("/{jobId}/download")
    public ResponseEntity<ExportDownloadResponse> downloadExport(
            @Parameter(description = "Unique asynchronous job identifier.", required = true)
            @PathVariable UUID jobId,
            @Parameter(hidden = true) Authentication authentication
    ) {
        return ResponseEntity.ok(exportService.downloadExport(jobId, authentication));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'COORDINATOR')")
    @Operation(
            summary = "Download Export File",
            description = "Download Export File through GET /api/v1/export-jobs/{jobId}/download-file. Successful execution returns HTTP 200 with Resource. Access: SecurityConfig roles ADMIN, COORDINATOR via matcher /api/v1/export-jobs/**; @PreAuthorize(\"hasAnyRole('ADMIN', 'COORDINATOR')\").",
            operationId = "exportJobDownloadExportFile",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Download export file completed successfully.",
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
                    responseCode = "404",
                    description = "The requested resource or action token was not found.",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "An unexpected server error occurred.",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            )
    })
    @GetMapping("/{jobId}/download-file")
    public ResponseEntity<Resource> downloadExportFile(
            @Parameter(description = "Unique asynchronous job identifier.", required = true)
            @PathVariable UUID jobId,
            @Parameter(hidden = true) Authentication authentication
    ) {
        return exportService.downloadExportFile(jobId, authentication);
    }
}
