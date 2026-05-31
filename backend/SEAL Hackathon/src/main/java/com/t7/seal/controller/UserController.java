package com.t7.seal.controller;

import com.t7.seal.config.ApiPaths;
import com.t7.seal.request.user.*;
import com.t7.seal.response.PageResponse;
import com.t7.seal.response.user.*;
import com.t7.seal.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping(ApiPaths.API_V1 + "/users")
public class UserController {

    private final UserService userService;

    @GetMapping
    public ResponseEntity<PageResponse<UserSummaryResponse>> getUsers(
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return null;
    }

    @GetMapping("/pending-approval")
    public ResponseEntity<PageResponse<UserApprovalResponse>> getPendingApprovalUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return null;
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/me")
    public ResponseEntity<ProfileResponse> getMyProfile(Authentication authentication) {
        return ResponseEntity.ok(userService.getMyProfile(authentication));
    }

    @GetMapping("/{userId}")
    public ResponseEntity<UserDetailResponse> getUserById(
            @PathVariable UUID userId
    ) {
        return null;
    }

    @PostMapping
    public ResponseEntity<UserDetailResponse> createUser(
            @Valid @RequestBody CreateUserRequest request
    ) {
        return null;
    }

    @PostMapping("/users/{userId}/approve")
    public ResponseEntity<UserApprovalResultResponse> approveUser(
            @PathVariable UUID userId
    ) {
        return null;
    }

    @PostMapping("/{userId}/reject")
    public ResponseEntity<UserApprovalResultResponse> rejectUser(
            @PathVariable UUID userId,
            @Valid @RequestBody RejectUserRequest request
    ) {
        return null;
    }

    @PostMapping("/guest-judge")
    public ResponseEntity<GuestJudgeResponse> createGuestJudge(
            @Valid @RequestBody CreateGuestJudgeRequest request
    ) {
        return null;
    }

    @PatchMapping("/{userId}")
    public ResponseEntity<UserDetailResponse> updateUser(
            @PathVariable UUID userId,
            @Valid @RequestBody UpdateUserRequest request
    ) {
        return null;
    }

    @PatchMapping("/{userId}/deactivate")
    public ResponseEntity<UserDetailResponse> deactivateUser(
            @PathVariable UUID userId
    ) {
        return null;
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
