package com.t7.seal.service.impl;

import com.t7.seal.entities.User;
import com.t7.seal.exception.BadRequestException;
import com.t7.seal.repository.UserRepository;
import com.t7.seal.request.user.ChangePasswordRequest;
import com.t7.seal.request.user.UpdateMyProfileRequest;
import com.t7.seal.response.user.ProfileResponse;
import com.t7.seal.service.CloudinaryStorageService;
import com.t7.seal.service.CurrentUserService;
import com.t7.seal.service.TokenBlacklistService;
import com.t7.seal.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {
    private final CurrentUserService currentUserService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final TokenBlacklistService tokenBlacklistService;
    private final CloudinaryStorageService cloudinaryStorageService;

    @Override
    @Transactional(readOnly = true)
    public ProfileResponse getMyProfile(Authentication authentication) {
        User user = currentUserService.getCurrentUser(authentication);

        return toProfileResponse(user);
    }

    @Override
    @Transactional
    public ProfileResponse updateMyProfile(Authentication authentication, UpdateMyProfileRequest request) {
        User user = currentUserService.getCurrentUser(authentication);

        validateUpdateProfileRequest(request);

        user.setFullName(request.fullName().trim());
        user.setPhone(trimToNull(request.phone()));
        user.setAvatarUrl(trimToNull(request.avatarUrl()));

        userRepository.save(user);

        return toProfileResponse(user);
    }

    @Override
    @Transactional
    public void changeMyPassword(Authentication authentication, ChangePasswordRequest request, String authorizationHeader) {
        User user = currentUserService.getCurrentUser(authentication);

        validateChangePasswordRequest(request);

        if (!request.newPassword().equals(request.confirmPassword())) {
            throw new BadRequestException("Password confirmation does not match.");
        }

        if (!passwordEncoder.matches(request.currentPassword(), user.getPasswordHash())) {
            throw new BadRequestException("Current password is incorrect.");
        }

        if (passwordEncoder.matches(request.newPassword(), user.getPasswordHash())) {
            throw new BadRequestException("New password must be different from the current password.");
        }

        user.updatePasswordHash(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);

        blacklistCurrentToken(authorizationHeader);
    }


    @Override
    @Transactional
    public ProfileResponse uploadFileAvatar(MultipartFile file, Authentication authentication) {
        User user = currentUserService.getCurrentUser(authentication);

        String avatarUrl = cloudinaryStorageService.uploadUserAvatar(user.getId(), file);

        user.setAvatarUrl(avatarUrl);

        return toProfileResponse(userRepository.save(user));
    }

    //HELPERS
    private ProfileResponse toProfileResponse(User user) {
        return new ProfileResponse(
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getPhone(),
                user.getAvatarUrl(),
                user.getRole().name(),
                user.getStatus().name()
        );
    }

    private String trimToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private void validateUpdateProfileRequest(UpdateMyProfileRequest request) {
        if (request == null) {
            throw new BadRequestException("Request body is required.");
        }

        if (request.fullName() == null || request.fullName().isBlank()) {
            throw new BadRequestException("Full name is required.");
        }

        if (request.fullName().trim().length() > 200) {
            throw new BadRequestException("Full name must not exceed 200 characters.");
        }

        if (request.phone() != null && request.phone().length() > 20) {
            throw new BadRequestException("Phone must not exceed 20 characters.");
        }

        if (request.avatarUrl() != null && request.avatarUrl().length() > 500) {
            throw new BadRequestException("Avatar URL must not exceed 500 characters.");
        }
    }

    private void validateChangePasswordRequest(ChangePasswordRequest request) {
        if (request == null) {
            throw new BadRequestException("Request body is required.");
        }

        if (request.currentPassword() == null || request.currentPassword().isBlank()) {
            throw new BadRequestException("Current password is required.");
        }

        if (request.newPassword() == null || request.newPassword().isBlank()) {
            throw new BadRequestException("New password is required.");
        }

        if (request.confirmPassword() == null || request.confirmPassword().isBlank()) {
            throw new BadRequestException("Confirm password is required.");
        }

        if (!request.newPassword().equals(request.confirmPassword())) {
            throw new BadRequestException("New password and confirm password do not match.");
        }

        validatePasswordStrength(request.newPassword());
    }

    private void validatePasswordStrength(String password) {
        if (password.length() < 8 || password.length() > 100) {
            throw new BadRequestException("Password must be between 8 and 100 characters.");
        }

        boolean hasLetter = password.chars().anyMatch(Character::isLetter);
        boolean hasDigit = password.chars().anyMatch(Character::isDigit);

        if (!hasLetter || !hasDigit) {
            throw new BadRequestException("Password must contain at least one letter and one digit.");
        }
    }

    private void blacklistCurrentToken(String authorizationHeader) {
        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            return;
        }

        String token = authorizationHeader.substring(7);

        if (!token.isBlank()) {
            tokenBlacklistService.blacklist(token);
        }
    }
}
