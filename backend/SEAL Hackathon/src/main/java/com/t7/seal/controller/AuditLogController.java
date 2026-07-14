package com.t7.seal.controller;

import com.t7.seal.config.ApiPaths;
import com.t7.seal.response.ApiErrorResponse;
import com.t7.seal.response.PageResponse;
import com.t7.seal.response.system.AuditLogResponse;
import com.t7.seal.service.AuditLogService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping(ApiPaths.API_V1)
@Tag(
        name = "Audit Logs",
        description = "Query append-only audit activity and supported action types."
)
public class AuditLogController {

    private final AuditLogService auditLogService;

    @PreAuthorize("hasAnyRole('ADMIN', 'COORDINATOR')")
    @Operation(
            summary = "Get Audit Logs",
            description = "Get Audit Logs through GET /api/v1/audit-logs; GET /api/v1/system/audit-logs; GET /api/v1/coordinator/audit-logs; GET /api/v1/admin/audit-logs. Successful execution returns HTTP 200 with PageResponse<AuditLogResponse>. Access: SecurityConfig roles ADMIN, COORDINATOR via matcher /api/v1/audit-logs; @PreAuthorize(\"hasAnyRole('ADMIN', 'COORDINATOR')\").",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Get audit logs completed successfully.",
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
    @GetMapping({
            "/audit-logs",
            "/system/audit-logs",
            "/coordinator/audit-logs",
            "/admin/audit-logs"
    })
    public ResponseEntity<PageResponse<AuditLogResponse>> getAuditLogs(
            @Parameter(description = "Actor Id value. (optional)", required = false)
            @RequestParam(required = false) UUID actorId,
            @Parameter(description = "Action Type value. (optional)", required = false)
            @RequestParam(required = false) String actionType,
            @Parameter(description = "Target Table value. (optional)", required = false)
            @RequestParam(required = false) String targetTable,
            @Parameter(description = "Target Id value. (optional)", required = false)
            @RequestParam(required = false) UUID targetId,
            @Parameter(description = "Unique event identifier. (optional)", required = false)
            @RequestParam(required = false) UUID eventId,
            @Parameter(description = "Unique team identifier. (optional)", required = false)
            @RequestParam(required = false) UUID teamId,
            @Parameter(description = "Unique submission identifier. (optional)", required = false)
            @RequestParam(required = false) UUID submissionId,
            @Parameter(description = "From value. (optional)", required = false)
            @RequestParam(required = false) String from,
            @Parameter(description = "To value. (optional)", required = false)
            @RequestParam(required = false) String to,
            @Parameter(description = "From Date value. (optional)", required = false)
            @RequestParam(required = false) String fromDate,
            @Parameter(description = "To Date value. (optional)", required = false)
            @RequestParam(required = false) String toDate,
            @Parameter(description = "Zero-based result page index. (default: 0, optional)", required = false)
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Maximum number of items returned in one page. (default: 20, optional)", required = false)
            @RequestParam(defaultValue = "20") int size,
            @Parameter(hidden = true) Authentication authentication
    ) {
        return ResponseEntity.ok(auditLogService.getAuditLogs(
                actorId,
                actionType,
                targetTable,
                targetId,
                eventId,
                teamId,
                submissionId,
                parseDateTime(firstNonBlank(from, fromDate)),
                parseDateTime(firstNonBlank(to, toDate)),
                page,
                size,
                authentication
        ));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'COORDINATOR')")
    @Operation(
            summary = "Get Audit Action Types",
            description = "Get Audit Action Types through GET /api/v1/audit-logs/actions; GET /api/v1/system/audit-logs/actions; GET /api/v1/coordinator/audit-logs/actions; GET /api/v1/admin/audit-logs/actions. Successful execution returns HTTP 200 with List<String>. Access: SecurityConfig roles ADMIN, COORDINATOR via matcher /api/v1/audit-logs/actions; @PreAuthorize(\"hasAnyRole('ADMIN', 'COORDINATOR')\").",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Get audit action types completed successfully.",
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
    @GetMapping({
            "/audit-logs/actions",
            "/system/audit-logs/actions",
            "/coordinator/audit-logs/actions",
            "/admin/audit-logs/actions"
    })
    public ResponseEntity<List<String>> getAuditActionTypes(
            @Parameter(hidden = true) Authentication authentication
    ) {
        return ResponseEntity.ok(auditLogService.getActionTypes(authentication));
    }

    private LocalDateTime parseDateTime(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return LocalDateTime.parse(value.trim());
    }

    private String firstNonBlank(String first, String second) {
        if (first != null && !first.isBlank()) {
            return first;
        }
        return second;
    }
}
