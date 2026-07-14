package com.t7.seal.controller;

import com.t7.seal.config.ApiPaths;
import com.t7.seal.request.user.*;
import com.t7.seal.response.ApiErrorResponse;
import com.t7.seal.response.PageResponse;
import com.t7.seal.response.user.*;
import com.t7.seal.service.UserService;
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
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping(ApiPaths.API_V1 + "/users")
@Tag(
        name = "Users",
        description = "User administration, approval, guest judges, and profile operations."
)
public class UserController {

    private final UserService userService;

    @Operation(
            summary = "Get Assignable Users",
            description = "Get Assignable Users through GET /api/v1/users/assignable. Successful execution returns HTTP 200 with List<AssignableUserResponse>. Access: SecurityConfig roles ADMIN, COORDINATOR via matcher /api/v1/users/assignable; @PreAuthorize(\"hasAnyRole('ADMIN', 'COORDINATOR')\").",
            operationId = "userGetAssignableUsers",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Get assignable users completed successfully.",
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
    @GetMapping("/assignable")
    @PreAuthorize("hasAnyRole('ADMIN', 'COORDINATOR')")
    public ResponseEntity<List<AssignableUserResponse>> getAssignableUsers(
            @Parameter(description = "Role value.", required = true)
            @RequestParam String role,
            @Parameter(description = "Optional free-text search term. (optional)", required = false)
            @RequestParam(required = false) String search
    ) {
        return ResponseEntity.ok(userService.getAssignableUsers(role, search));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'COORDINATOR')")
    @Operation(
            summary = "Get Users",
            description = "Get Users through GET /api/v1/users. Successful execution returns HTTP 200 with PageResponse<UserSummaryResponse>. Access: SecurityConfig roles ADMIN, COORDINATOR via matcher /api/v1/users; @PreAuthorize(\"hasAnyRole('ADMIN', 'COORDINATOR')\").",
            operationId = "userGetUsers",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Get users completed successfully.",
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
    @GetMapping
    public ResponseEntity<PageResponse<UserSummaryResponse>> getUsers(
            @Parameter(description = "Role value. (optional)", required = false)
            @RequestParam(required = false) String role,
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
        return ResponseEntity.ok(
                userService.getUsers(role, status, search, page, size, authentication)
        );
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'COORDINATOR')")
    @Operation(
            summary = "Get Pending Approval Users",
            description = "Get Pending Approval Users through GET /api/v1/users/pending-approval. Successful execution returns HTTP 200 with PageResponse<UserApprovalResponse>. Access: SecurityConfig roles ADMIN, COORDINATOR via matcher /api/v1/users/*; @PreAuthorize(\"hasAnyRole('ADMIN', 'COORDINATOR')\").",
            operationId = "userGetPendingApprovalUsers",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Get pending approval users completed successfully.",
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
    @GetMapping("/pending-approval")
    public ResponseEntity<PageResponse<UserApprovalResponse>> getPendingApprovalUsers(
            @Parameter(description = "Zero-based result page index. (default: 0, optional)", required = false)
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Maximum number of items returned in one page. (default: 20, optional)", required = false)
            @RequestParam(defaultValue = "20") int size,
            @Parameter(hidden = true) Authentication authentication
    ) {
        return ResponseEntity.ok(userService.getPendingApprovalUsers(page, size, authentication));
    }

    @PreAuthorize("isAuthenticated()")
    @Operation(
            summary = "Get My Profile",
            description = "Get My Profile through GET /api/v1/users/me. Successful execution returns HTTP 200 with ProfileResponse. Access: Authenticated via SecurityConfig matcher /api/v1/users/me; @PreAuthorize(\"isAuthenticated()\").",
            operationId = "userGetMyProfile",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Get my profile completed successfully.",
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
    @GetMapping("/me")
    public ResponseEntity<ProfileResponse> getMyProfile(
            @Parameter(hidden = true) Authentication authentication
    ) {
        return ResponseEntity.ok(userService.getMyProfile(authentication));
    }


    @PreAuthorize("hasAnyRole('ADMIN', 'COORDINATOR')")
    @GetMapping("/{userId}")
    public ResponseEntity<UserDetailResponse> getUserById(
            @PathVariable UUID userId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(userService.getUserById(userId, authentication));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'COORDINATOR')")
    @PostMapping
    public ResponseEntity<UserDetailResponse> createUser(
            @Valid @RequestBody CreateUserRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(userService.createUser(request, authentication));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'COORDINATOR')")
    @PostMapping("/{userId}/approve")
    public ResponseEntity<UserApprovalResultResponse> approveUser(
            @PathVariable UUID userId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(userService.approveUser(userId, authentication));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'COORDINATOR')")
    @PostMapping("/{userId}/reject")
    public ResponseEntity<UserApprovalResultResponse> rejectUser(
            @PathVariable UUID userId,
            @Valid @RequestBody RejectUserRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(userService.rejectUser(userId, request, authentication));
    }

    @PreAuthorize("hasRole('COORDINATOR')")
    @PostMapping("/guest-judge")
    public ResponseEntity<GuestJudgeResponse> createGuestJudge(
            @Valid @RequestBody CreateGuestJudgeRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(userService.createGuestJudge(request, authentication));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'COORDINATOR')")
    @PatchMapping("/{userId}")
    public ResponseEntity<UserDetailResponse> updateUser(
            @PathVariable UUID userId,
            @Valid @RequestBody UpdateUserRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(userService.updateUser(userId, request, authentication));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'COORDINATOR')")
    @PatchMapping("/{userId}/deactivate")
    public ResponseEntity<UserDetailResponse> deactivateUser(
            @PathVariable UUID userId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(userService.deactivateUser(userId, authentication));
    }

    @PreAuthorize("isAuthenticated()")
    @PatchMapping("/me")
    public ResponseEntity<ProfileResponse> updateMyProfile(
            Authentication authentication,
            @Valid @RequestBody UpdateMyProfileRequest request
    ) {
        return ResponseEntity.ok(userService.updateMyProfile(authentication, request));
    }

    @PreAuthorize("isAuthenticated()")
    @PatchMapping("/me/password")
    public ResponseEntity<Void> changeMyPassword(
            Authentication authentication,
            @Valid @RequestBody ChangePasswordRequest request,
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader
    ) {
        userService.changeMyPassword(authentication, request, authorizationHeader);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("isAuthenticated()")
    @PostMapping(
            value = "/me/avatar",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<ProfileResponse> uploadAvatar(
            @RequestPart("file") MultipartFile file,
            Authentication authentication
    ) {
        return ResponseEntity.ok(userService.uploadFileAvatar(file, authentication));
    }
}
