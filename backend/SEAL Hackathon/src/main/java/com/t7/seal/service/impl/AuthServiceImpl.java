package com.t7.seal.service.impl;

import com.t7.seal.domain.StudentType;
import com.t7.seal.domain.UserRole;
import com.t7.seal.domain.UserStatus;
import com.t7.seal.entities.StudentProfile;
import com.t7.seal.entities.User;
import com.t7.seal.exception.BadRequestException;
import com.t7.seal.exception.ConflictException;
import com.t7.seal.exception.UnauthorizedException;
import com.t7.seal.repository.UserRepository;
import com.t7.seal.request.auth.*;
import com.t7.seal.response.auth.*;
import com.t7.seal.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;
    private final TokenBlacklistService tokenBlacklistService;
    private final TokenGenerator tokenGenerator;
    private final EmailService emailService;

    @Value("${app.email-verification-expiration-minutes:30}")
    private int emailVerificationExpirationMinutes;

    @Value("${app.password-reset-expiration-minutes:15}")
    private int passwordResetExpirationMinutes;

    @Override
    @Transactional
    public RegisterResponse register(RegisterRequest request) {
        String email = normalizeEmail(request.email());

        if (userRepository.existsByEmail(email)) {
            throw new ConflictException("Email already exists.");
        }

        StudentType studentType = parseStudentType(request.studentType());

        if (studentType == StudentType.EXTERNAL && isBlank(request.universityName())) {
            throw new BadRequestException(
                    "University name is required for external students."
            );
        }

        String verificationCode = tokenGenerator.generateSixDigitCode();
        LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(emailVerificationExpirationMinutes);

        User user = User.builder()
                .email(email)
                .passwordHash(passwordEncoder.encode(request.password()))
                .fullName(request.fullName().trim())
                .phone(trimToNull(request.phone()))
                .role(UserRole.STUDENT)
                .status(UserStatus.UNVERIFIED)
                .emailVerificationToken(verificationCode)
                .emailVerificationExpiresAt(expiresAt)
                .failedLoginCount(0)
                .build();

        StudentProfile profile = StudentProfile.builder()
                .studentType(studentType)
                .studentCode(trimToNull(request.studentCode()))
                .universityName(studentType == StudentType.EXTERNAL
                        ? trimToNull(request.universityName()) : null)
                .major(trimToNull(request.major()))
                .graduationYear(request.graduationYear())
                .user(user)
                .build();

        user.setStudentProfile(profile);

        User saved = userRepository.save(user);

        emailService.sendVerificationCode(
                saved.getEmail(),
                saved.getFullName(),
                verificationCode,
                emailVerificationExpirationMinutes
        );

        return new RegisterResponse(
                saved.getId(),
                saved.getEmail(),
                saved.getStatus().name(),
                emailVerificationExpirationMinutes * 60,
                "Registration successful. Please check your email for the verification code."
        );
    }

    @Override
    @Transactional
    public VerifyEmailResponse verifyEmail(VerifyEmailRequest request) {
        String email = normalizeEmail(request.email());

        User user = userRepository
                .findByEmailAndEmailVerificationToken(email, request.code())
                .orElseThrow(() -> new BadRequestException("Invalid verification code."));

        if (!user.isUnverified()) {
            throw new BadRequestException("This account has already been verified.");
        }

        if (user.getEmailVerificationExpiresAt() != null
                && LocalDateTime.now().isAfter(user.getEmailVerificationExpiresAt())) {
            throw new BadRequestException("Verification code has expired.");
        }

        user.verifyEmail();
        user.setEmailVerificationExpiresAt(null);

//        user.setStatus(UserStatus.ACTIVE);

        userRepository.save(user);

        return new VerifyEmailResponse(
                user.getId(),
                user.getEmail(),
                user.getStatus().name(),
                "Email verified successfully. Your account is waiting for coordinator approval."
        );
    }

    @Override
    @Transactional
    public AuthMessageResponse resendVerification(EmailRequest request) {
        String email = normalizeEmail(request.email());

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("Account not found."));

        if (!user.isUnverified()) {
            throw new BadRequestException("This account does not need email verification.");
        }

        String code = tokenGenerator.generateSixDigitCode();
        user.setEmailVerificationToken(code);
        user.setEmailVerificationExpiresAt(LocalDateTime.now().plusMinutes(emailVerificationExpirationMinutes));

        userRepository.save(user);
        emailService.sendVerificationCode(user.getEmail(), user.getFullName(), code, emailVerificationExpirationMinutes);

        return new AuthMessageResponse("A new verification code has been sent.");
    }

    @Override
    @Transactional
    public LoginResponse login(LoginRequest request) {
        String email = normalizeEmail(request.email());

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password."));

        if (user.isLocked()) {
            throw new UnauthorizedException("Account is temporarily locked. Please try again later.");
        }

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            user.recordFailedLogin();
            userRepository.save(user);
            throw new UnauthorizedException("Invalid email or password.");
        }

        if (user.isUnverified()) {
            throw new UnauthorizedException("Please verify your email before logging in.");
        }

        if (user.isPendingApproval()) {
            throw new UnauthorizedException("Your account is waiting for coordinator approval.");
        }

        if (!user.canLogin()) {
            throw new UnauthorizedException("Your account is not allowed to login.");
        }

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String accessToken = jwtService.generateAccessToken(userDetails);
        String refreshToken = jwtService.generateRefreshToken(userDetails);

        user.recordSuccessfulLogin();
        userRepository.save(user);

        return new LoginResponse(
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getRole().name(),
                user.getStatus().name(),
                user.getAvatarUrl(),
                accessToken,
                refreshToken,
                jwtService.getAccessTokenExpirationMs(),
                jwtService.getRefreshTokenExpirationMs()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public RefreshTokenResponse refreshToken(TokenRequest request) {
        String refreshToken = request.token();

        if (!jwtService.isRefreshToken(refreshToken)) {
            throw new UnauthorizedException("Invalid refresh token.");
        }

        String email = jwtService.extractUsername(refreshToken);
        UserDetails userDetails = userDetailsService.loadUserByUsername(email);

        if (!jwtService.isTokenValid(refreshToken, userDetails)) {
            throw new UnauthorizedException("Invalid refresh token.");
        }

        return new RefreshTokenResponse(
                jwtService.generateAccessToken(userDetails),
                jwtService.generateRefreshToken(userDetails),
                jwtService.getAccessTokenExpirationMs(),
                jwtService.getRefreshTokenExpirationMs()
        );
    }

    @Override
    public void logout(String authorizationHeader) {
        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            return;
        }

        String token = authorizationHeader.substring(7);

        try {
            tokenBlacklistService.blacklist(token, jwtService.extractExpirationMillis(token));
        } catch (Exception ignored) {
            tokenBlacklistService.blacklist(token);
        }
    }

    @Override
    @Transactional
    public AuthMessageResponse forgotPassword(EmailRequest request) {
        String email = normalizeEmail(request.email());

        userRepository.findByEmail(email).ifPresent(user -> {
            String resetCode = tokenGenerator.generateSixDigitCode();
            user.requestPasswordReset(resetCode, passwordResetExpirationMinutes);
            userRepository.save(user);
            emailService.sendPasswordResetCode(user.getEmail(), user.getFullName(), resetCode, passwordResetExpirationMinutes);
        });

        return new AuthMessageResponse("If the email exists, a password reset code has been sent.");
    }

    @Override
    @Transactional
    public AuthMessageResponse resetPassword(ResetPasswordRequest request) {
        if (!request.newPassword().equals(request.confirmPassword())) {
            throw new BadRequestException("Password confirmation does not match.");
        }

        String email = normalizeEmail(request.email());

        User user = userRepository.findByEmailAndPasswordResetToken(email, request.code())
                .orElseThrow(() -> new BadRequestException("Invalid or expired reset code."));

        if (!user.isPasswordResetTokenValid(request.code())) {
            throw new BadRequestException("Invalid or expired reset code.");
        }

        user.updatePasswordHash(passwordEncoder.encode(request.newPassword()));
        user.setFailedLoginCount(0);
        user.setLockedUntil(null);

        userRepository.save(user);

        return new AuthMessageResponse("Password has been reset successfully.");
    }

    private StudentType parseStudentType(String raw) {
        try {
            return StudentType.valueOf(raw.trim().toUpperCase());
        } catch (Exception ex) {
            throw new BadRequestException("Invalid student type. Supported values: FPT, EXTERNAL.");
        }
    }

    private String normalizeEmail(String email) {
        return email == null ? null : email.trim().toLowerCase();
    }

    private String trimToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}

