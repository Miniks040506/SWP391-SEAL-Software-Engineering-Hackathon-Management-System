package com.t7.seal.service.impl;

import com.t7.seal.domain.StudentType;
import com.t7.seal.domain.UserRole;
import com.t7.seal.domain.UserStatus;
import com.t7.seal.entities.StudentProfile;
import com.t7.seal.entities.User;
import com.t7.seal.exception.BadRequestException;
import com.t7.seal.exception.UnauthorizedException;
import com.t7.seal.repository.UserRepository;
import com.t7.seal.response.auth.LoginResponse;
import com.t7.seal.security.oauth2.GithubOAuth2UserInfo;
import com.t7.seal.security.oauth2.GoogleOAuth2UserInfo;
import com.t7.seal.security.oauth2.OAuth2UserInfo;
import com.t7.seal.service.EmailService;
import com.t7.seal.service.JwtService;
import com.t7.seal.service.OAuth2Service;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Locale;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class OAuth2ServiceImpl implements OAuth2Service {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;
    private final EmailService emailService;

    @Override
    @Transactional
    public LoginResponse authenticateOAuth2User(
            String registrationId,
            OAuth2User oAuth2User,
            String resolvedEmail
    ) {
        OAuth2UserInfo userInfo = toUserInfo(registrationId, oAuth2User, resolvedEmail);

        if (userInfo.email() == null || userInfo.email().isBlank()) {
            throw new BadRequestException("Cannot get email from " + registrationId + ".");
        }

        String email = userInfo.email().trim().toLowerCase(Locale.ROOT);

        User user = userRepository
                .findByOauthProviderAndOauthProviderId(userInfo.provider(), userInfo.providerId())
                .or(() -> userRepository.findByEmail(email))
                .map(existing -> updateExistingOAuthUser(existing, userInfo))
                .orElseGet(() -> createNewOAuthUser(userInfo));

        if (user.isUnverified() || user.isPendingApproval()) {
            if (user.getEmailVerifiedAt() == null) {
                user.setEmailVerifiedAt(LocalDateTime.now());
            }
            user.setStatus(UserStatus.ACTIVE);
        }

        userRepository.save(user);

        if (!user.canLogin()) {
            throw new UnauthorizedException("Your account is not allowed to login.");
        }

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());

        String accessToken = jwtService.generateAccessToken(userDetails);
        String refreshToken = jwtService.generateRefreshToken(userDetails);

        user.recordSuccessfulLogin();
        userRepository.save(user);

        String providerName = toProviderDisplayName(registrationId);
        sendOAuthLoginSuccessEmailSafely(user, providerName);

        return new LoginResponse(
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getRole().name(),
                user.getStatus().name(),
                accessToken,
                refreshToken,
                jwtService.getAccessTokenExpirationMs(),
                jwtService.getRefreshTokenExpirationMs()
        );
    }

    private OAuth2UserInfo toUserInfo(String registrationId, OAuth2User user, String resolvedEmail) {
        return switch (registrationId.toLowerCase(Locale.ROOT)) {
            case "google" -> new GoogleOAuth2UserInfo(user.getAttributes());
            case "github" -> new GithubOAuth2UserInfo(user.getAttributes(), resolvedEmail);
            default -> throw new BadRequestException("Unsupported OAuth2 provider: " + registrationId);
        };
    }

    private User updateExistingOAuthUser(User user, OAuth2UserInfo info) {
        user.setOAuthIdentity(info.provider(), info.providerId());

        if (info.avatarUrl() != null) {
            user.setAvatarUrl(info.avatarUrl());
        }

        if (user.getEmailVerifiedAt() == null) {
            user.setEmailVerifiedAt(LocalDateTime.now());
        }

        if (user.getStatus() == UserStatus.UNVERIFIED
                || user.getStatus() == UserStatus.PENDING_APPROVAL) {
            user.setStatus(UserStatus.ACTIVE);
        }

        return user;
    }

    private User createNewOAuthUser(OAuth2UserInfo info) {
        String email = info.email().trim().toLowerCase(Locale.ROOT);

        StudentType studentType = email.endsWith("@fpt.edu.vn")
                ? StudentType.FPT
                : StudentType.EXTERNAL;

        User user = User.builder()
                .email(email)
                .passwordHash(passwordEncoder.encode(UUID.randomUUID().toString()))
                .fullName(info.name())
                .avatarUrl(info.avatarUrl())
                .role(UserRole.STUDENT)
                .status(UserStatus.ACTIVE)
                .emailVerifiedAt(LocalDateTime.now())
                .failedLoginCount(0)
                .build();

        user.setOAuthIdentity(info.provider(), info.providerId());

        StudentProfile profile = StudentProfile.builder()
                .studentType(studentType)
                .universityName(null)
                .user(user)
                .build();

        user.setStudentProfile(profile);

        return user;
    }

    private String toProviderDisplayName(String registrationId) {
        if ("google".equalsIgnoreCase(registrationId)) {
            return "Google";
        }

        if ("github".equalsIgnoreCase(registrationId)) {
            return "GitHub";
        }

        return registrationId;
    }

    private void sendOAuthLoginSuccessEmailSafely(User user, String providerName) {
        try {
            emailService.sendOAuthLoginSuccessEmail(
                    user.getEmail(),
                    user.getFullName(),
                    providerName
            );
        } catch (Exception ex) {
            log.warn(
                    "Cannot send OAuth login success email to {} via {}: {}",
                    user.getEmail(),
                    providerName,
                    ex.getMessage()
            );
        }
    }
}
