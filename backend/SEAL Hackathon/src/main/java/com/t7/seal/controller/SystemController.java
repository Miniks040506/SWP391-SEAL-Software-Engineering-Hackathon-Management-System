package com.t7.seal.controller;

import com.t7.seal.config.ApiPaths;
import com.t7.seal.request.system.UpdateSystemConfigRequest;
import com.t7.seal.response.ApiErrorResponse;
import com.t7.seal.response.system.SystemConfigResponse;
import com.t7.seal.response.system.SystemHealthResponse;
import com.t7.seal.service.SystemConfigService;
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
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(ApiPaths.API_V1 + "/system")
@RequiredArgsConstructor
@Tag(
        name = "System",
        description = "System configuration and health information."
)
public class SystemController {

    private final SystemConfigService systemConfigService;

    @PreAuthorize("hasRole('ADMIN')")
    @Operation(
            summary = "Get System Config",
            description = "Get System Config through GET /api/v1/system/config. Successful execution returns HTTP 200 with List<SystemConfigResponse>. Access: SecurityConfig role ADMIN via matcher /api/v1/system/config/**; @PreAuthorize(\"hasRole('ADMIN')\").",
            operationId = "systemGetSystemConfig",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Get system config completed successfully.",
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
                    responseCode = "500",
                    description = "An unexpected server error occurred.",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            )
    })
    @GetMapping("/config")
    public ResponseEntity<List<SystemConfigResponse>> getSystemConfig(
            @Parameter(description = "Category value. (optional)", required = false)
            @RequestParam(required = false) String category,
            @Parameter(description = "Include Secrets value. (default: false, optional)", required = false)
            @RequestParam(defaultValue = "false") boolean includeSecrets,
            @Parameter(hidden = true) Authentication authentication
    ) {
        return ResponseEntity.ok(systemConfigService
                .getSystemConfig(category, includeSecrets, authentication));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @Operation(
            summary = "Get System Config By Key",
            description = "Get System Config By Key through GET /api/v1/system/config/{key}. Successful execution returns HTTP 200 with SystemConfigResponse. Access: SecurityConfig role ADMIN via matcher /api/v1/system/config/**; @PreAuthorize(\"hasRole('ADMIN')\").",
            operationId = "systemGetSystemConfigByKey",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Get system config by key completed successfully.",
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
    @GetMapping("/config/{key}")
    public ResponseEntity<SystemConfigResponse> getSystemConfigByKey(
            @Parameter(description = "Key value.", required = true)
            @PathVariable String key,
            @Parameter(description = "Include Secrets value. (default: false, optional)", required = false)
            @RequestParam(defaultValue = "false") boolean includeSecrets,
            @Parameter(hidden = true) Authentication authentication
    ) {
        return ResponseEntity.ok(systemConfigService
                .getSystemConfigByKey(key, includeSecrets, authentication));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @Operation(
            summary = "Update System Config",
            description = "Update System Config through PUT /api/v1/system/config. Successful execution returns HTTP 200 with List<SystemConfigResponse>. Access: SecurityConfig role ADMIN via matcher /api/v1/system/config/**; @PreAuthorize(\"hasRole('ADMIN')\"). Requires an UpdateSystemConfigRequest request body validated with Jakarta Bean Validation.",
            operationId = "systemUpdateSystemConfig",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Update system config completed successfully.",
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
                    responseCode = "500",
                    description = "An unexpected server error occurred.",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            )
    })
    @PutMapping("/config")
    public ResponseEntity<List<SystemConfigResponse>> updateSystemConfig(
            @Valid @RequestBody UpdateSystemConfigRequest request,
            @Parameter(hidden = true) Authentication authentication
    ) {
        return ResponseEntity.ok(systemConfigService
                .updateSystemConfig(request, authentication));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @Operation(
            summary = "Seed Default System Config",
            description = "Seed Default System Config through POST /api/v1/system/config/defaults. Successful execution returns HTTP 204 without a response body. Access: SecurityConfig role ADMIN via matcher /api/v1/system/config/**; @PreAuthorize(\"hasRole('ADMIN')\").",
            operationId = "systemSeedDefaultSystemConfig",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Seed default system config completed successfully with no response body."),
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
                    responseCode = "500",
                    description = "An unexpected server error occurred.",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            )
    })
    @PostMapping("/config/defaults")
    public ResponseEntity<Void> seedDefaultSystemConfig(@Parameter(hidden = true) Authentication authentication) {
        systemConfigService.seedDefaults(authentication);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @Operation(
            summary = "Get System Health",
            description = "Get System Health through GET /api/v1/system/health. Successful execution returns HTTP 200 with SystemHealthResponse. Access: SecurityConfig role ADMIN via matcher /api/v1/system/health; @PreAuthorize(\"hasRole('ADMIN')\").",
            operationId = "systemGetSystemHealth",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Get system health completed successfully.",
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
                    responseCode = "500",
                    description = "An unexpected server error occurred.",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            )
    })
    @GetMapping("/health")
    public ResponseEntity<SystemHealthResponse> getSystemHealth(@Parameter(hidden = true) Authentication authentication) {
        return ResponseEntity.ok(systemConfigService.getSystemHealth(authentication));
    }
}
