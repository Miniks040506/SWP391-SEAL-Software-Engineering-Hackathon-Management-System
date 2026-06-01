package com.t7.seal.service;

import com.t7.seal.request.user.*;
import com.t7.seal.response.PageResponse;
import com.t7.seal.response.user.*;
import org.springframework.security.core.Authentication;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

public interface UserService {
    ProfileResponse getMyProfile(Authentication authentication);

    ProfileResponse updateMyProfile(Authentication authentication, UpdateMyProfileRequest request);

    void changeMyPassword(Authentication authentication, ChangePasswordRequest request, String authorizationHeader);

    ProfileResponse uploadFileAvatar(MultipartFile file, Authentication authentication);

    UserDetailResponse getUserById(UUID id, Authentication authentication);

    UserDetailResponse createUser(CreateUserRequest request, Authentication authentication);

    UserApprovalResultResponse approveUser(UUID id, Authentication authentication);

    UserApprovalResultResponse rejectUser(UUID id, RejectUserRequest request, Authentication authentication);

    GuestJudgeResponse createGuestJudge(CreateGuestJudgeRequest request, Authentication authentication);

    UserDetailResponse updateUser(UUID id, UpdateUserRequest request, Authentication authentication);

    UserDetailResponse deactivateUser(UUID id, Authentication authentication);

    PageResponse<UserSummaryResponse> getUsers(
            String role,
            String status,
            String search,
            int page,
            int size,
            Authentication authentication
    );

    PageResponse<UserApprovalResponse> getPendingApprovalUsers(
            int page,
            int size,
            Authentication authentication
    );
}
