package com.t7.seal.entities;

import com.t7.seal.domain.UserRole;
import com.t7.seal.domain.UserStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "user")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private UUID id;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Column(name = "full_name", length = 200, nullable = false)
    private String fullName;

    @Column(length = 20)
    private String phone;

    @Enumerated(EnumType.STRING)
    @Column(length = 200)
    @Builder.Default
    private UserRole role = UserRole.STUDENT;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private UserStatus status = UserStatus.UNVERIFIED;

    @Column(name = "email_verified_at")
    private LocalDateTime emailVerifiedAt;

    @Column(name = "email_verification_token", unique = true, length = 100)
    private String emailVerificationToken;

    @Column(name = "password_reset_token", unique = true, length = 100)
    private String passwordResetToken;

    @Column(name = "password_reset_expires_at")
    private LocalDateTime passwordResetExpiresAt;

    @Column(name = "avatar_url", length = 500)
    private String avatarUrl;

    @Column(name = "last_login_at")
    private LocalDateTime lastLoginAt;

    @Column(name = "failed_login_count", nullable = false)
    private Integer failedLoginCount = 0;

    @Column(name = "locked_until")
    private LocalDateTime lockedUntil;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    // True only when account status is ACTIVE.
    public boolean isActive() {
        return status == UserStatus.ACTIVE;
    }

    // Email has been confirmed via the verification link (UC-02).
    public boolean isVerified() {
        return emailVerifiedAt != null;
    }

    // Account is currently inside a login lockout window (UC-03).
    public boolean isLocked(LocalDateTime now) {
        return lockedUntil != null && lockedUntil.isAfter(now);
    }

    // ACTIVE account that is not in a lockout window — allowed to authenticate.
    public boolean canLogin(LocalDateTime now) {
        return status == UserStatus.ACTIVE && !isLocked(now);
    }

    // UC-02: user clicked verify link — stamp time, drop token, move to PENDING_APPROVAL.
    public void markEmailVerified(LocalDateTime now) {
        emailVerifiedAt = now;
        emailVerificationToken = null;
        status = UserStatus.PENDING_APPROVAL;
    }

    // UC-07: coordinator approves; only legal from PENDING_APPROVAL.
    public void approve() {
        if (status != UserStatus.PENDING_APPROVAL) {
            throw new IllegalStateException("User must be pending approval before approval");
        }
        status = UserStatus.ACTIVE;
    }

    // UC-03: increment failure counter; once 5 consecutive fails are reached, lock for 15 minutes.
    public void recordFailedLogin(LocalDateTime now) {
        failedLoginCount = (failedLoginCount == null ? 0 : failedLoginCount) + 1;
        if (failedLoginCount >= 5) {
            lockedUntil = now.plusMinutes(15);
        }
    }

    // UC-03: successful login clears the lockout state and updates lastLoginAt.
    public void recordSuccessfulLogin(LocalDateTime now) {
        lastLoginAt = now;
        failedLoginCount = 0;
        lockedUntil = null;
    }
}
