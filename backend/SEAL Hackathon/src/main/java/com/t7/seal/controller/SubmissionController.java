package com.t7.seal.controller;

import com.t7.seal.config.ApiPaths;
import com.t7.seal.request.submission.SubmitDeliverablesRequest;
import com.t7.seal.request.submission.ImportGoogleDriveFileRequest;
import com.t7.seal.request.submission.SubmissionLinkRequest;
import com.t7.seal.request.submission.UpdateSubmissionRequest;
import com.t7.seal.request.submission.UpdateSubmissionLinkMetadataRequest;
import com.t7.seal.request.results.DisqualifySubmissionRequest;
import com.t7.seal.response.ApiErrorResponse;
import com.t7.seal.response.PageResponse;
import com.t7.seal.response.submission.*;
import com.t7.seal.response.results.DisqualificationResponse;
import com.t7.seal.service.DisqualificationService;
import com.t7.seal.service.RankingService;
import com.t7.seal.service.SubmissionService;
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
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping(ApiPaths.API_V1)
@Tag(
        name = "Submissions",
        description = "Submission drafts, deliverables, files, metadata, and score visibility."
)
public class SubmissionController {

    private final SubmissionService submissionService;
    private final RankingService rankingService;
    private final DisqualificationService disqualificationService;

    @PreAuthorize("isAuthenticated()")
    @Operation(
            summary = "Get Submission Requirements",
            description = "Returns the authoritative submission requirements, server upload limits, provider availability, current draft state, and current-user permissions for a team and round.",
            operationId = "submissionGetRequirements",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Submission requirements returned successfully.",
                    useReturnTypeSchema = true
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "The round does not belong to the team's event.",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Authentication is required or the access token is invalid.",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            ),
            @ApiResponse(
                    responseCode = "403",
                    description = "The current user is not allowed to view this team's submission requirements.",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "The team or round was not found.",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "An unexpected server error occurred.",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            )
    })
    @GetMapping("/teams/{teamId}/rounds/{roundId}/submission-requirements")
    public ResponseEntity<SubmissionRequirementsResponse> getSubmissionRequirements(
            @Parameter(description = "Unique team identifier.", required = true)
            @PathVariable UUID teamId,
            @Parameter(description = "Unique round identifier.", required = true)
            @PathVariable UUID roundId,
            @Parameter(hidden = true) Authentication authentication
    ) {
        return ResponseEntity.ok(
                submissionService.getSubmissionRequirements(teamId, roundId, authentication)
        );
    }

    @PreAuthorize("isAuthenticated()")
    @Operation(
            summary = "Submit Deliverables",
            description = "Submit Deliverables through POST /api/v1/teams/{teamId}/rounds/{roundId}/submission; POST /api/v1/teams/{teamId}/rounds/{roundId}/submissions. Successful execution returns HTTP 201 with SubmissionResponse. Access: Authenticated via SecurityConfig matcher /api/v1/teams/**; @PreAuthorize(\"isAuthenticated()\"). Requires a SubmitDeliverablesRequest request body validated with Jakarta Bean Validation.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "201",
                    description = "Submit deliverables completed and the resource was created.",
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
    @PostMapping({
            "/teams/{teamId}/rounds/{roundId}/submission",
            "/teams/{teamId}/rounds/{roundId}/submissions"
    })
    public ResponseEntity<SubmissionResponse> submitDeliverables(
            @Parameter(description = "Unique team identifier.", required = true)
            @PathVariable UUID teamId,
            @Parameter(description = "Unique round identifier.", required = true)
            @PathVariable UUID roundId,
            @Valid @RequestBody SubmitDeliverablesRequest request,
            @Parameter(hidden = true) Authentication authentication
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(submissionService.submitDeliverables(teamId, roundId, request, authentication));
    }

    @PreAuthorize("isAuthenticated()")
    @Operation(
            summary = "Save Submission Draft",
            description = "Save Submission Draft through POST /api/v1/teams/{teamId}/rounds/{roundId}/submission/draft; POST /api/v1/teams/{teamId}/rounds/{roundId}/submissions/draft. Successful execution returns HTTP 201 with SubmissionResponse. Access: Authenticated via SecurityConfig matcher /api/v1/teams/**; @PreAuthorize(\"isAuthenticated()\"). Optionally accepts an UpdateSubmissionRequest request body validated with Jakarta Bean Validation.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "201",
                    description = "Save submission draft completed and the resource was created.",
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
    @PostMapping({
            "/teams/{teamId}/rounds/{roundId}/submission/draft",
            "/teams/{teamId}/rounds/{roundId}/submissions/draft"
    })
    public ResponseEntity<SubmissionResponse> saveSubmissionDraft(
            @Parameter(description = "Unique team identifier.", required = true)
            @PathVariable UUID teamId,
            @Parameter(description = "Unique round identifier.", required = true)
            @PathVariable UUID roundId,
            @Valid @RequestBody(required = false) UpdateSubmissionRequest request,
            @Parameter(hidden = true) Authentication authentication
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(submissionService.saveSubmissionDraft(teamId, roundId, request, authentication));
    }

    @PreAuthorize("isAuthenticated()")
    @Operation(
            summary = "Upload Submission File",
            description = "Upload Submission File through POST /api/v1/teams/{teamId}/rounds/{roundId}/submission/file; POST /api/v1/teams/{teamId}/rounds/{roundId}/submissions/files. Successful execution returns HTTP 201 with SubmissionResponse. Access: Authenticated via SecurityConfig matcher /api/v1/teams/**; @PreAuthorize(\"isAuthenticated()\"). Consumes \"multipart/form-data\".",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "201",
                    description = "Upload submission file completed and the resource was created.",
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
                    responseCode = "409",
                    description = "The operation conflicts with the current resource or workflow state.",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            ),
            @ApiResponse(
                    responseCode = "413",
                    description = "The uploaded file exceeds the configured size limit.",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            ),
            @ApiResponse(
                    responseCode = "415",
                    description = "The uploaded media type is not supported.",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "An unexpected server error occurred.",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            )
    })
    @PostMapping(value = {
            "/teams/{teamId}/rounds/{roundId}/submission/file",
            "/teams/{teamId}/rounds/{roundId}/submissions/files"
    }, consumes = "multipart/form-data")
    public ResponseEntity<SubmissionResponse> uploadSubmissionFile(
            @Parameter(description = "Unique team identifier.", required = true)
            @PathVariable UUID teamId,
            @Parameter(description = "Unique round identifier.", required = true)
            @PathVariable UUID roundId,
            @Parameter(description = "Link Type value.", required = true)
            @RequestParam String linkType,
            @Parameter(description = "Note value. (optional)", required = false)
            @RequestParam(required = false) String note,
            @Parameter(description = "Label value. (optional)", required = false)
            @RequestParam(required = false) String label,
            @Parameter(description = "Is Primary value. (default: false, optional)", required = false)
            @RequestParam(required = false, defaultValue = "false") Boolean isPrimary,
            @Parameter(description = "Display Order value. (default: 0, optional)", required = false)
            @RequestParam(required = false, defaultValue = "0") Integer displayOrder,
            @Parameter(description = "Submit Now value. (default: false, optional)", required = false)
            @RequestParam(required = false, defaultValue = "false") Boolean submitNow,
            @Parameter(description = "Uploaded binary file.", required = true)
            @RequestPart("file") MultipartFile file,
            @Parameter(hidden = true) Authentication authentication
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(submissionService.uploadSubmissionFile(
                        teamId, roundId, linkType,
                        note, label, isPrimary,
                        displayOrder, submitNow,
                        file, authentication
                ));
    }

    @PreAuthorize("isAuthenticated()")
    @Operation(
            summary = "Import Google Drive evidence",
            description = "Validates a Google Picker selection and snapshots it into internal submission storage without exposing refresh credentials.",
            operationId = "submissionImportGoogleDriveFile",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Drive evidence imported into the draft.", useReturnTypeSchema = true),
            @ApiResponse(responseCode = "400", description = "Invalid file ID, evidence type, or request.", content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))),
            @ApiResponse(responseCode = "401", description = "Authentication or Drive authorization is invalid.", content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))),
            @ApiResponse(responseCode = "403", description = "The user cannot mutate this team or Drive denied access.", content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "Team, round, or selected Drive file was not found.", content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))),
            @ApiResponse(responseCode = "409", description = "Draft, round, file-count, provider, or storage state conflicts with import.", content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))),
            @ApiResponse(responseCode = "413", description = "Selected file exceeds the configured maximum size.", content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))),
            @ApiResponse(responseCode = "415", description = "Selected file MIME type or extension is unsupported.", content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))),
            @ApiResponse(responseCode = "429", description = "Google Drive rate limit reached.", content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))),
            @ApiResponse(responseCode = "503", description = "Google Drive or internal storage is unavailable.", content = @Content(schema = @Schema(implementation = ApiErrorResponse.class)))
    })
    @PostMapping(
            value = "/teams/{teamId}/rounds/{roundId}/submission/google-drive",
            consumes = "application/json"
    )
    public ResponseEntity<SubmissionResponse> importGoogleDriveFile(
            @Parameter(description = "Unique team identifier.", required = true)
            @PathVariable UUID teamId,
            @Parameter(description = "Unique round identifier.", required = true)
            @PathVariable UUID roundId,
            @Valid @RequestBody ImportGoogleDriveFileRequest request,
            @Parameter(hidden = true) Authentication authentication
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(submissionService.importGoogleDriveFile(
                        teamId,
                        roundId,
                        request,
                        authentication
                ));
    }

    @PreAuthorize("isAuthenticated()")
    @Operation(
            summary = "Upload File To Submission",
            description = "Upload File To Submission through POST /api/v1/submissions/{submissionId}/files. Successful execution returns HTTP 201 with SubmissionResponse. Access: SecurityConfig roles STUDENT, JUDGE, MENTOR, COORDINATOR via matcher /api/v1/submissions/**; @PreAuthorize(\"isAuthenticated()\"). Consumes \"multipart/form-data\".",
            operationId = "submissionUploadFileToSubmission",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "201",
                    description = "Upload file to submission completed and the resource was created.",
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
                    responseCode = "409",
                    description = "The operation conflicts with the current resource or workflow state.",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            ),
            @ApiResponse(
                    responseCode = "413",
                    description = "The uploaded file exceeds the configured size limit.",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            ),
            @ApiResponse(
                    responseCode = "415",
                    description = "The uploaded media type is not supported.",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "An unexpected server error occurred.",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            )
    })
    @PostMapping(value = "/submissions/{submissionId}/files", consumes = "multipart/form-data")
    public ResponseEntity<SubmissionResponse> uploadFileToSubmission(
            @Parameter(description = "Unique submission identifier.", required = true)
            @PathVariable UUID submissionId,
            @Parameter(description = "Link Type value.", required = true)
            @RequestParam String linkType,
            @Parameter(description = "Label value. (optional)", required = false)
            @RequestParam(required = false) String label,
            @Parameter(description = "Is Primary value. (default: false, optional)", required = false)
            @RequestParam(required = false, defaultValue = "false") Boolean isPrimary,
            @Parameter(description = "Display Order value. (default: 0, optional)", required = false)
            @RequestParam(required = false, defaultValue = "0") Integer displayOrder,
            @Parameter(description = "Submit Now value. (default: false, optional)", required = false)
            @RequestParam(required = false, defaultValue = "false") Boolean submitNow,
            @Parameter(description = "Uploaded binary file.", required = true)
            @RequestPart("file") MultipartFile file,
            @Parameter(hidden = true) Authentication authentication
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(submissionService.uploadFileToSubmission(
                        submissionId, linkType,
                        label, isPrimary,
                        displayOrder, submitNow,
                        file, authentication
                ));
    }

    @PreAuthorize("isAuthenticated()")
    @Operation(
            summary = "Get Team Submissions",
            description = "Get Team Submissions through GET /api/v1/teams/{teamId}/submissions. Successful execution returns HTTP 200 with List<SubmissionSummaryResponse>. Access: Authenticated via SecurityConfig matcher /api/v1/teams/**; @PreAuthorize(\"isAuthenticated()\").",
            operationId = "submissionGetTeamSubmissions",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Get team submissions completed successfully.",
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
    @GetMapping("/teams/{teamId}/submissions")
    public ResponseEntity<List<SubmissionSummaryResponse>> getTeamSubmissions(
            @Parameter(description = "Unique team identifier.", required = true)
            @PathVariable UUID teamId,
            @Parameter(hidden = true) Authentication authentication
    ) {
        return ResponseEntity.ok(submissionService.getTeamSubmissions(teamId, authentication));
    }

    @PreAuthorize("isAuthenticated()")
    @Operation(
            summary = "Get Submission By Id",
            description = "Get Submission By Id through GET /api/v1/submissions/{submissionId}. Successful execution returns HTTP 200 with SubmissionDetailResponse. Access: SecurityConfig roles STUDENT, JUDGE, MENTOR, COORDINATOR via matcher /api/v1/submissions/**; @PreAuthorize(\"isAuthenticated()\").",
            operationId = "submissionGetSubmissionById",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Get submission by id completed successfully.",
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
    @GetMapping("/submissions/{submissionId}")
    public ResponseEntity<SubmissionDetailResponse> getSubmissionById(
            @Parameter(description = "Unique submission identifier.", required = true)
            @PathVariable UUID submissionId,
            @Parameter(hidden = true) Authentication authentication
    ) {
        return ResponseEntity.ok(submissionService.
                getSubmissionById(submissionId, authentication));
    }

    @PreAuthorize("isAuthenticated()")
    @Operation(
            summary = "Get Submission Attempt History",
            description = "Returns immutable finalized attempts newest-first for users authorized to view the submission.",
            operationId = "submissionGetSubmissionAttempts",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Submission attempt history returned successfully.",
                    useReturnTypeSchema = true
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Authentication is required or the access token is invalid.",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            ),
            @ApiResponse(
                    responseCode = "403",
                    description = "The authenticated user cannot view this submission.",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "The submission was not found.",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            )
    })
    @GetMapping("/submissions/{submissionId}/attempts")
    public ResponseEntity<List<SubmissionAttemptResponse>> getSubmissionAttempts(
            @Parameter(description = "Unique submission identifier.", required = true)
            @PathVariable UUID submissionId,
            @Parameter(hidden = true) Authentication authentication
    ) {
        return ResponseEntity.ok(
                submissionService.getSubmissionAttempts(submissionId, authentication)
        );
    }

    @PreAuthorize("hasAnyRole('ADMIN','COORDINATOR')")
    @Operation(
            summary = "Get Submission Admin View",
            description = "Get Submission Admin View through GET /api/v1/submissions/{submissionId}/admin-view. Successful execution returns HTTP 200 with SubmissionDetailResponse. Access: SecurityConfig roles STUDENT, JUDGE, MENTOR, COORDINATOR via matcher /api/v1/submissions/**; @PreAuthorize(\"hasAnyRole('ADMIN','COORDINATOR')\").",
            operationId = "submissionGetSubmissionAdminView",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Get submission admin view completed successfully.",
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
    @GetMapping("/submissions/{submissionId}/admin-view")
    public ResponseEntity<SubmissionDetailResponse> getSubmissionAdminView(
            @Parameter(description = "Unique submission identifier.", required = true)
            @PathVariable UUID submissionId,
            @Parameter(hidden = true) Authentication authentication
    ) {
        return ResponseEntity.ok(submissionService.
                getSubmissionForAdmin(submissionId, authentication));
    }

    @PreAuthorize("isAuthenticated()")
    @Operation(
            summary = "Update Submission",
            description = "Update Submission through PATCH /api/v1/submissions/{submissionId}. Successful execution returns HTTP 200 with SubmissionResponse. Access: SecurityConfig roles STUDENT, JUDGE, MENTOR, COORDINATOR via matcher /api/v1/submissions/**; @PreAuthorize(\"isAuthenticated()\"). Requires an UpdateSubmissionRequest request body validated with Jakarta Bean Validation.",
            operationId = "submissionUpdateSubmission",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Update submission completed successfully.",
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
    @PatchMapping("/submissions/{submissionId}")
    public ResponseEntity<SubmissionResponse> updateSubmission(
            @Parameter(description = "Unique submission identifier.", required = true)
            @PathVariable UUID submissionId,
            @Valid @RequestBody UpdateSubmissionRequest request,
            @Parameter(hidden = true) Authentication authentication
    ) {
        return ResponseEntity.ok(submissionService.
                updateSubmission(submissionId, request, authentication));
    }

    @PreAuthorize("isAuthenticated()")
    @Operation(
            summary = "Submit Existing Submission",
            description = "Submit Existing Submission through POST /api/v1/submissions/{submissionId}/submit. Successful execution returns HTTP 200 with SubmissionResponse. Access: SecurityConfig roles STUDENT, JUDGE, MENTOR, COORDINATOR via matcher /api/v1/submissions/**; @PreAuthorize(\"isAuthenticated()\").",
            operationId = "submissionSubmitExistingSubmission",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Submit existing submission completed successfully.",
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
    @PostMapping("/submissions/{submissionId}/submit")
    public ResponseEntity<SubmissionResponse> submitExistingSubmission(
            @Parameter(description = "Unique submission identifier.", required = true)
            @PathVariable UUID submissionId,
            @Parameter(hidden = true) Authentication authentication
    ) {
        return ResponseEntity.ok(submissionService.submitExistingSubmission(submissionId, authentication));
    }

    @PreAuthorize("isAuthenticated()")
    @Operation(
            summary = "Begin Submission Resubmission",
            description = "Reopens a finalized submission as the next draft attempt while preserving its immutable history.",
            operationId = "submissionBeginResubmission",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "The next draft attempt is ready for editing.",
                    useReturnTypeSchema = true
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Authentication is required or the access token is invalid.",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            ),
            @ApiResponse(
                    responseCode = "403",
                    description = "Only the team leader can begin a resubmission.",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "The submission was not found.",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            ),
            @ApiResponse(
                    responseCode = "409",
                    description = "The submission, round, lock, or deadline state prevents resubmission.",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            )
    })
    @PostMapping("/submissions/{submissionId}/resubmit")
    public ResponseEntity<SubmissionResponse> beginSubmissionResubmission(
            @Parameter(description = "Unique submission identifier.", required = true)
            @PathVariable UUID submissionId,
            @Parameter(hidden = true) Authentication authentication
    ) {
        return ResponseEntity.ok(
                submissionService.beginSubmissionResubmission(submissionId, authentication)
        );
    }

    @PreAuthorize("isAuthenticated()")
    @Operation(
            summary = "Add Submission Links",
            description = "Add Submission Links through POST /api/v1/submissions/{submissionId}/links. Successful execution returns HTTP 201 with SubmissionResponse. Access: SecurityConfig roles STUDENT, JUDGE, MENTOR, COORDINATOR via matcher /api/v1/submissions/**; @PreAuthorize(\"isAuthenticated()\"). Requires a SubmissionLinkRequest request body validated with Jakarta Bean Validation.",
            operationId = "submissionAddSubmissionLinks",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "201",
                    description = "Add submission links completed and the resource was created.",
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
    @PostMapping("/submissions/{submissionId}/links")
    public ResponseEntity<SubmissionResponse> addSubmissionLinks(
            @Parameter(description = "Unique submission identifier.", required = true)
            @PathVariable UUID submissionId,
            @Valid @RequestBody SubmissionLinkRequest request,
            @Parameter(hidden = true) Authentication authentication
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(submissionService.addSubmissionLinks(submissionId, request, authentication));
    }

    @PreAuthorize("isAuthenticated()")
    @Operation(
            summary = "Update Submission Link",
            description = "Update Submission Link through PATCH /api/v1/submission-links/{linkId}. Successful execution returns HTTP 200 with SubmissionLinkResponse. Access: SecurityConfig roles STUDENT, COORDINATOR via matcher /api/v1/submission-links/**; @PreAuthorize(\"isAuthenticated()\"). Requires a SubmissionLinkRequest request body validated with Jakarta Bean Validation.",
            operationId = "submissionUpdateSubmissionLink",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Update submission link completed successfully.",
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
    @PatchMapping("/submission-links/{linkId}")
    public ResponseEntity<SubmissionLinkResponse> updateSubmissionLink(
            @Parameter(description = "Link Id value.", required = true)
            @PathVariable UUID linkId,
            @Valid @RequestBody SubmissionLinkRequest request,
            @Parameter(hidden = true) Authentication authentication
    ) {
        return ResponseEntity.ok(submissionService.updateSubmissionLink(linkId, request, authentication));
    }

    @PreAuthorize("isAuthenticated()")
    @Operation(
            summary = "Update Submission Evidence Metadata",
            description = "Updates type, label, primary flag, or display order without changing the evidence URL or storage identity.",
            operationId = "submissionUpdateSubmissionLinkMetadata",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Submission evidence metadata updated successfully.",
                    useReturnTypeSchema = true
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "No metadata was provided or a metadata value is invalid.",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Authentication is required or the access token is invalid.",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            ),
            @ApiResponse(
                    responseCode = "403",
                    description = "Only the team leader may edit this evidence.",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Submission evidence was not found.",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            ),
            @ApiResponse(
                    responseCode = "409",
                    description = "The round is closed, locked, or past its submission deadline.",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            )
    })
    @PatchMapping("/submission-links/{linkId}/metadata")
    public ResponseEntity<SubmissionLinkResponse> updateSubmissionLinkMetadata(
            @Parameter(description = "Unique submission evidence identifier.", required = true)
            @PathVariable UUID linkId,
            @Valid @RequestBody UpdateSubmissionLinkMetadataRequest request,
            @Parameter(hidden = true) Authentication authentication
    ) {
        return ResponseEntity.ok(
                submissionService.updateSubmissionLinkMetadata(linkId, request, authentication)
        );
    }

    @PreAuthorize("isAuthenticated()")
    @Operation(
            summary = "Delete Submission Link",
            description = "Delete Submission Link through DELETE /api/v1/submission-links/{linkId}. Successful execution returns HTTP 204 without a response body. Access: SecurityConfig roles STUDENT, COORDINATOR via matcher /api/v1/submission-links/**; @PreAuthorize(\"isAuthenticated()\").",
            operationId = "submissionDeleteSubmissionLink",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Delete submission link completed successfully with no response body."),
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
    @DeleteMapping("/submission-links/{linkId}")
    public ResponseEntity<Void> deleteSubmissionLink(
            @Parameter(description = "Link Id value.", required = true)
            @PathVariable UUID linkId,
            @Parameter(hidden = true) Authentication authentication
    ) {
        submissionService.deleteSubmissionLink(linkId, authentication);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("hasRole('COORDINATOR')")
    @Operation(
            summary = "Disqualify Submission",
            description = "Disqualify Submission through POST /api/v1/submissions/{submissionId}/disqualify. Successful execution returns HTTP 201 with DisqualificationResponse. Access: SecurityConfig role COORDINATOR via matcher /api/v1/submissions/*/disqualify; @PreAuthorize(\"hasRole('COORDINATOR')\"). Requires a DisqualifySubmissionRequest request body validated with Jakarta Bean Validation.",
            operationId = "submissionDisqualifySubmission",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "201",
                    description = "Disqualify submission completed and the resource was created.",
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
    @PostMapping("/submissions/{submissionId}/disqualify")
    public ResponseEntity<DisqualificationResponse> disqualifySubmission(
            @Parameter(description = "Unique submission identifier.", required = true)
            @PathVariable UUID submissionId,
            @Valid @RequestBody DisqualifySubmissionRequest request,
            @Parameter(hidden = true) Authentication authentication
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(disqualificationService
                        .disqualifySubmission(submissionId, request, authentication));
    }

    @PreAuthorize("hasAnyRole('ADMIN','COORDINATOR')")
    @Operation(
            summary = "Get Event Submissions",
            description = "Get Event Submissions through GET /api/v1/submissions. Successful execution returns HTTP 200 with PageResponse<CoordinatorSubmissionSummaryResponse>. Access: SecurityConfig roles ADMIN, COORDINATOR via matcher /api/v1/submissions; @PreAuthorize(\"hasAnyRole('ADMIN','COORDINATOR')\").",
            operationId = "submissionGetEventSubmissions",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Get event submissions completed successfully.",
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
    @GetMapping("/submissions")
    public ResponseEntity<PageResponse<CoordinatorSubmissionSummaryResponse>> getEventSubmissions(
            @Parameter(description = "Unique event identifier. (optional)", required = false)
            @RequestParam(required = false) UUID eventId,
            @Parameter(description = "Unique round identifier. (optional)", required = false)
            @RequestParam(required = false) UUID roundId,
            @Parameter(description = "Unique track identifier. (optional)", required = false)
            @RequestParam(required = false) UUID trackId,
            @Parameter(description = "Optional status filter. (optional)", required = false)
            @RequestParam(required = false) String status,
            @Parameter(description = "Optional free-text search term. (optional)", required = false)
            @RequestParam(required = false) String search,
            @Parameter(description = "Zero-based result page index. (default: 0, optional)", required = false)
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Maximum number of items returned in one page. (default: 20, optional)", required = false)
            @RequestParam(defaultValue = "20") int size,
            @Parameter(hidden = true) Authentication authentication
    ) {
        return ResponseEntity.ok(submissionService.getEventSubmissions(eventId, roundId, trackId, status, search, page, size, authentication));
    }

    @PreAuthorize("hasAnyRole('ADMIN','COORDINATOR')")
    @Operation(
            summary = "Get Round Submissions",
            description = "Get Round Submissions through GET /api/v1/rounds/{roundId}/submissions. Successful execution returns HTTP 200 with List<SubmissionSummaryResponse>. Access: Authenticated via SecurityConfig matcher anyRequest(); @PreAuthorize(\"hasAnyRole('ADMIN','COORDINATOR')\").",
            operationId = "submissionGetRoundSubmissions",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Get round submissions completed successfully.",
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
    @GetMapping("/rounds/{roundId}/submissions")
    public ResponseEntity<List<SubmissionSummaryResponse>> getRoundSubmissions(
            @Parameter(description = "Unique round identifier.", required = true)
            @PathVariable UUID roundId,
            @Parameter(hidden = true) Authentication authentication
    ) {
        return ResponseEntity.ok(submissionService.getRoundSubmissions(roundId, authentication));
    }

    @PreAuthorize("hasAnyRole('ADMIN','COORDINATOR')")
    @Operation(
            summary = "Get Track Submissions",
            description = "Get Track Submissions through GET /api/v1/tracks/{trackId}/submissions. Successful execution returns HTTP 200 with List<SubmissionSummaryResponse>. Access: Authenticated via SecurityConfig matcher anyRequest(); @PreAuthorize(\"hasAnyRole('ADMIN','COORDINATOR')\").",
            operationId = "submissionGetTrackSubmissions",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Get track submissions completed successfully.",
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
    @GetMapping("/tracks/{trackId}/submissions")
    public ResponseEntity<List<SubmissionSummaryResponse>> getTrackSubmissions(
            @Parameter(description = "Unique track identifier.", required = true)
            @PathVariable UUID trackId,
            @Parameter(hidden = true) Authentication authentication
    ) {
        return ResponseEntity.ok(submissionService.getTrackSubmissions(trackId, authentication));
    }

    @PreAuthorize("hasAnyRole('MENTOR', 'ADMIN', 'COORDINATOR')")
    @Operation(
            summary = "Get Mentor Team Submissions",
            description = "Get Mentor Team Submissions through GET /api/v1/mentor/teams/{teamId}/submissions. Successful execution returns HTTP 200 with List<SubmissionSummaryResponse>. Access: SecurityConfig roles MENTOR, COORDINATOR, ADMIN via matcher /api/v1/mentor/**; @PreAuthorize(\"hasAnyRole('MENTOR', 'ADMIN', 'COORDINATOR')\").",
            operationId = "submissionGetMentorTeamSubmissions",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Get mentor team submissions completed successfully.",
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
    @GetMapping("/mentor/teams/{teamId}/submissions")
    public ResponseEntity<List<SubmissionSummaryResponse>> getMentorTeamSubmissions(
            @Parameter(description = "Unique team identifier.", required = true)
            @PathVariable UUID teamId,
            @Parameter(hidden = true) Authentication authentication
    ) {
        return ResponseEntity.ok(submissionService.getMentorTeamSubmissions(teamId, authentication));
    }

    @PreAuthorize("hasAnyRole('MENTOR', 'ADMIN', 'COORDINATOR')")
    @Operation(
            summary = "Get Mentor Submission By Id",
            description = "Get Mentor Submission By Id through GET /api/v1/mentor/submissions/{submissionId}. Successful execution returns HTTP 200 with SubmissionDetailResponse. Access: SecurityConfig roles MENTOR, COORDINATOR, ADMIN via matcher /api/v1/mentor/**; @PreAuthorize(\"hasAnyRole('MENTOR', 'ADMIN', 'COORDINATOR')\").",
            operationId = "submissionGetMentorSubmissionById",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Get mentor submission by id completed successfully.",
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
    @GetMapping("/mentor/submissions/{submissionId}")
    public ResponseEntity<SubmissionDetailResponse> getMentorSubmissionById(
            @Parameter(description = "Unique submission identifier.", required = true)
            @PathVariable UUID submissionId,
            @Parameter(hidden = true) Authentication authentication
    ) {
        return ResponseEntity.ok(submissionService.getMentorSubmissionById(submissionId, authentication));
    }

    @PreAuthorize("isAuthenticated()")
    @Operation(
            summary = "Create Submission File Download Url",
            description = "Create Submission File Download Url through GET /api/v1/submission-links/{linkId}/download-url. Successful execution returns HTTP 200 with FileDownloadUrlResponse. Access: SecurityConfig roles STUDENT, COORDINATOR via matcher /api/v1/submission-links/**; @PreAuthorize(\"isAuthenticated()\").",
            operationId = "submissionCreateSubmissionFileDownloadUrl",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Create submission file download url completed successfully.",
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
    @GetMapping("/submission-links/{linkId}/download-url")
    public ResponseEntity<FileDownloadUrlResponse> createSubmissionFileDownloadUrl(
            @Parameter(description = "Link Id value.", required = true)
            @PathVariable UUID linkId,
            @Parameter(hidden = true) Authentication authentication
    ) {
        return ResponseEntity.ok(submissionService.createSubmissionFileDownloadUrl(linkId, authentication));
    }

    @PreAuthorize("isAuthenticated()")
    @Operation(
            summary = "Create Submission Attempt File Download URL",
            description = "Creates a short-lived download URL for authorized immutable attempt evidence.",
            operationId = "submissionCreateAttemptFileDownloadUrl",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Short-lived attempt evidence download URL created successfully.",
                    useReturnTypeSchema = true
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "The evidence is not a downloadable uploaded file.",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Authentication is required or the access token is invalid.",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            ),
            @ApiResponse(
                    responseCode = "403",
                    description = "The authenticated user cannot view this submission.",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "The submission or attempt evidence was not found.",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            )
    })
    @GetMapping("/submissions/{submissionId}/attempts/evidence/{evidenceId}/download-url")
    public ResponseEntity<FileDownloadUrlResponse> createSubmissionAttemptFileDownloadUrl(
            @Parameter(description = "Unique submission identifier.", required = true)
            @PathVariable UUID submissionId,
            @Parameter(description = "Immutable attempt-evidence identifier.", required = true)
            @PathVariable UUID evidenceId,
            @Parameter(hidden = true) Authentication authentication
    ) {
        return ResponseEntity.ok(submissionService.createSubmissionAttemptFileDownloadUrl(
                submissionId,
                evidenceId,
                authentication
        ));
    }

    @PreAuthorize("isAuthenticated()")
    @Operation(
            summary = "Get My Team Detailed Scores",
            description = "Get My Team Detailed Scores through GET /api/v1/submissions/{submissionId}/scores/me. Successful execution returns HTTP 200 with TeamDetailedScoreResponse. Access: SecurityConfig roles STUDENT, JUDGE, MENTOR, COORDINATOR via matcher /api/v1/submissions/**; @PreAuthorize(\"isAuthenticated()\").",
            operationId = "submissionGetMyTeamDetailedScores",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Get my team detailed scores completed successfully.",
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
    @GetMapping("/submissions/{submissionId}/scores/me")
    public ResponseEntity<TeamDetailedScoreResponse> getMyTeamDetailedScores(
            @Parameter(description = "Unique submission identifier.", required = true)
            @PathVariable UUID submissionId,
            @Parameter(hidden = true) Authentication authentication
    ) {
        return ResponseEntity.ok(rankingService.getPublishedSubmissionScore(submissionId, authentication));
    }
}
