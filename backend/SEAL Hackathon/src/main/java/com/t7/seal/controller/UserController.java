package com.t7.seal.controller;

import com.t7.seal.config.ApiPaths;
import com.t7.seal.request.user.*;
import com.t7.seal.response.PageResponse;
import com.t7.seal.response.user.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping(ApiPaths.API_V1 + "/users")
public class UserController {

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

    @GetMapping("/me")
    public ResponseEntity<ProfileResponse> getMyProfile() {
        return null;
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

    @PatchMapping("/me")
    public ResponseEntity<ProfileResponse> updateMyProfile(
            @Valid @RequestBody UpdateMyProfileRequest request
    ) {
        return null;
    }

    @PatchMapping("/me/password")
    public ResponseEntity<Void> changeMyPassword(
            @Valid @RequestBody ChangePasswordRequest request
    ) {
        return null;
    }
}
