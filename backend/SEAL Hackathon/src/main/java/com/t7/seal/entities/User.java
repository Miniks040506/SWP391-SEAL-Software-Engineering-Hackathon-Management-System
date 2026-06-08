package com.t7.seal.entities;

import com.t7.seal.domain.UserRole;
import com.t7.seal.domain.UserStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.springframework.security.crypto.bcrypt.BCrypt;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(
        name = "users",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_user_email",
                        columnNames = "email"
                ),
                @UniqueConstraint(
                        name = "uk_user_email_verification_token",
                        columnNames = "email_verification_token"
                ),
                @UniqueConstraint(
                        name = "uk_user_password_reset_token",
                        columnNames = "password_reset_token"
                )
        },
        indexes = {
                @Index(name = "idx_user_role", columnList = "role"),
                @Index(name = "idx_user_status", columnList = "status"),
                @Index(name = "idx_user_email_verified_at", columnList = "email_verified_at"),
                @Index(name = "idx_user_last_login_at", columnList = "last_login_at"),
                @Index(name = "idx_user_locked_until", columnList = "locked_until")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "email", nullable = false, unique = true, length = 255, updatable = false)
    private String email;

    // BCrypt password hash.
    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;

    @Column(name = "full_name", nullable = false, length = 200)
    private String fullName;

    @Column(name = "phone", length = 20)
    private String phone;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false, length = 30)
    private UserRole role;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    @Builder.Default
    private UserStatus status = UserStatus.UNVERIFIED;

    @Column(name = "email_verified_at")
    private LocalDateTime emailVerifiedAt;

    // Random email verification token.
    @Column(name = "email_verification_token", unique = true, length = 100)
    private String emailVerificationToken;

    @Column(name = "email_verification_expires_at")
    private LocalDateTime emailVerificationExpiresAt;

    @Column(name = "oauth_provider", length = 30)
    private String oauthProvider;

    @Column(name = "oauth_provider_id", length = 150)
    private String oauthProviderId;

    @Column(name = "password_reset_token", unique = true, length = 100)
    private String passwordResetToken;

    @Column(name = "password_reset_expires_at")
    private LocalDateTime passwordResetExpiresAt;

    @Column(name = "avatar_url", length = 500)
    private String avatarUrl;

    @Column(name = "last_login_at")
    private LocalDateTime lastLoginAt;

    /**
     * Number of consecutive failed login attempts.
     * This value should be reset to 0 after successful login.
     * When it reaches the configured threshold, the account can be locked.
     */
    @Column(name = "failed_login_count", nullable = false)
    @Builder.Default
    private Integer failedLoginCount = 0;

    @Column(name = "locked_until")
    private LocalDateTime lockedUntil;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    // Relationships

    @OneToOne(
            mappedBy = "user",
            cascade = CascadeType.ALL,
            orphanRemoval = true,
            fetch = FetchType.LAZY
    )
    private StudentProfile studentProfile;

    @OneToOne(
            mappedBy = "user",
            cascade = CascadeType.ALL,
            orphanRemoval = true,
            fetch = FetchType.LAZY
    )
    private Judge judge;

    @OneToOne(mappedBy = "user")
    private TeamMember teamMemberships;

    @OneToMany(mappedBy = "leader")
    private List<Team> ledTeams;

    @OneToMany(mappedBy = "user")
    private List<MentorAssignment> mentorAssignments;

    @OneToMany(mappedBy = "mentor")
    private List<MentorFeedback> mentorFeedbacks;

    @OneToMany(mappedBy = "invitee")
    private List<TeamInvitation> sentInvitations;

    @OneToMany(mappedBy = "actor")
    private List<AuditLog> auditLogs;

    @OneToMany(mappedBy = "createdBy")
    private List<Notification> createdNotifications;

    // Lifecycle validation

    @PrePersist
    @PreUpdate
    private void validate() {
        validateRequiredFields();
        applyDefaults();
    }

    private void validateRequiredFields() {
        if (email == null || email.isBlank()) {
            throw new IllegalStateException("Email is required.");
        }

        if (passwordHash == null || passwordHash.isBlank()) {
            throw new IllegalStateException("Password hash is required.");
        }

        if (fullName == null || fullName.isBlank()) {
            throw new IllegalStateException("Full name is required.");
        }

        if (role == null) {
            throw new IllegalStateException("User role is required.");
        }
    }

    private void applyDefaults() {
        if (status == null) {
            status = UserStatus.UNVERIFIED;
        }

        if (failedLoginCount == null || failedLoginCount < 0) {
            failedLoginCount = 0;
        }
    }

    // Helper methods

    public boolean isStudent() {
        return role == UserRole.STUDENT;
    }

    public boolean isJudge() {
        return role == UserRole.JUDGE;
    }

    public boolean isMentor() {
        return role == UserRole.MENTOR;
    }

    public boolean isCoordinator() {
        return role == UserRole.COORDINATOR;
    }

    public boolean isAdmin() {
        return role == UserRole.ADMIN;
    }

    public boolean isUnverified() {
        return status == UserStatus.UNVERIFIED;
    }

    public boolean isPendingApproval() {
        return status == UserStatus.PENDING_APPROVAL;
    }

    public boolean isActive() {
        return status == UserStatus.ACTIVE;
    }

    public boolean isSuspended() {
        return status == UserStatus.SUSPENDED;
    }

    public boolean isDeactivated() {
        return status == UserStatus.DEACTIVATED;
    }

    public boolean isEmailVerified() {
        return emailVerifiedAt != null;
    }

    /**
     * Checks whether the account is currently locked.
     */
    public boolean isLocked() {
        return lockedUntil != null && LocalDateTime.now().isBefore(lockedUntil);
    }

    public boolean hasExpiredLock() {
        return lockedUntil != null && !LocalDateTime.now().isBefore(lockedUntil);
    }

    public long getRemainingLockSeconds() {
        if (!isLocked()) {
            return 0;
        }

        return Math.max(
                0,
                java.time.Duration.between(LocalDateTime.now(), lockedUntil).getSeconds()
        );
    }

    public void clearExpiredLockIfNecessary() {
        if (hasExpiredLock()) {
            failedLoginCount = 0;
            lockedUntil = null;
        }
    }

    // Checks whether this user can log in.
    public boolean canLogin() {
        return isActive() && !isLocked();
    }


    // Marks email as verified and moves the account to pending approval.
    public void verifyEmail() {
        this.emailVerifiedAt = LocalDateTime.now();
        this.emailVerificationToken = null;

        if (this.status == UserStatus.UNVERIFIED || this.status == UserStatus.PENDING_APPROVAL) {
            this.status = UserStatus.ACTIVE;
        }
    }


    // Approves the account after coordinator review.
    public void approve() {
        if (!isEmailVerified()) {
            throw new IllegalStateException("Cannot approve user before email verification.");
        }

        this.status = UserStatus.ACTIVE;
    }

    public void suspend() {
        this.status = UserStatus.SUSPENDED;
    }

    public void deactivate() {
        this.status = UserStatus.DEACTIVATED;
    }

    /**
     * Records successful login.
     * This resets failed login count and clears account lock.
     */
    public void recordSuccessfulLogin() {
        this.lastLoginAt = LocalDateTime.now();
        clearFailedLoginAttempts();
    }

    public void clearFailedLoginAttempts() {
        this.failedLoginCount = 0;
        this.lockedUntil = null;
    }

    /**
     * Records failed login attempt.
     * When failed attempts reach the threshold, account is locked for the configured duration.
     */
    public void recordFailedLogin(int maxFailedAttempts, int lockDurationMinutes) {
        if (maxFailedAttempts <= 0) {
            throw new IllegalArgumentException("Max failed attempts must be greater than 0.");
        }

        if (lockDurationMinutes <= 0) {
            throw new IllegalArgumentException("Lock duration must be greater than 0.");
        }

        clearExpiredLockIfNecessary();

        if (this.failedLoginCount == null) {
            this.failedLoginCount = 0;
        }

        this.failedLoginCount++;

        if (this.failedLoginCount >= maxFailedAttempts) {
            this.lockedUntil = LocalDateTime.now().plusMinutes(lockDurationMinutes);
        }
    }

    /**
     * Backward-compatible default for existing internal calls.
     */
    public void recordFailedLogin() {
        recordFailedLogin(5, 15);
    }


    // Stores a new password reset token.
    public void requestPasswordReset(String token, int expirationMinutes) {
        if (token == null || token.isBlank()) {
            throw new IllegalArgumentException("Password reset token is required.");
        }

        this.passwordResetToken = token;
        this.passwordResetExpiresAt = LocalDateTime.now().plusMinutes(expirationMinutes);
    }


    // Clears password reset token after successful reset or expiration cleanup.
    public void clearPasswordResetToken() {
        this.passwordResetToken = null;
        this.passwordResetExpiresAt = null;
    }


    // Checks whether a password reset token is still valid.
    public boolean isPasswordResetTokenValid(String token) {
        if (token == null || token.isBlank()) {
            return false;
        }

        if (passwordResetToken == null || passwordResetExpiresAt == null) {
            return false;
        }

        return passwordResetToken.equals(token)
                && LocalDateTime.now().isBefore(passwordResetExpiresAt);
    }


    // Updates password hash and clears reset token.
    public void updatePasswordHash(String newPasswordHash) {
        if (newPasswordHash == null || newPasswordHash.isBlank()) {
            throw new IllegalArgumentException("Password hash is required.");
        }

        this.passwordHash = newPasswordHash;
        clearPasswordResetToken();
    }

    public boolean isEmailVerificationCodeValid(String code) {
        if (code == null || code.isBlank()) return false;
        if (emailVerificationToken == null) return false;
        if (!emailVerificationToken.equals(code)) return false;

        return emailVerificationExpiresAt == null
                || LocalDateTime.now().isBefore(emailVerificationExpiresAt);
    }

    public void setOAuthIdentity(String provider, String providerId) {
        this.oauthProvider = provider;
        this.oauthProviderId = providerId;
    }
}