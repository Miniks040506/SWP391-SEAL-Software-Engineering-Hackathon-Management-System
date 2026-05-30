package com.t7.seal.service;

import com.t7.seal.request.user.ChangePasswordRequest;
import com.t7.seal.request.user.UpdateMyProfileRequest;
import com.t7.seal.response.user.ProfileResponse;
import org.springframework.security.core.Authentication;

public interface UserService {
    ProfileResponse getMyProfile(Authentication authentication);

    ProfileResponse updateMyProfile(Authentication authentication, UpdateMyProfileRequest request);

    void changeMyPassword(Authentication authentication, ChangePasswordRequest request, String authorizationHeader);
}
