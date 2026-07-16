package com.t7.seal.entities;

import com.t7.seal.domain.ExternalProvider;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(
        name = "provider_oauth_connections",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_provider_oauth_connection_user_provider",
                columnNames = {"user_id", "provider"}
        ),
        indexes = @Index(
                name = "idx_provider_oauth_connection_provider",
                columnList = "provider"
        )
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProviderOAuthConnection {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "provider", nullable = false, length = 30)
    private ExternalProvider provider;

    @Column(name = "provider_account_id", nullable = false, length = 255)
    private String providerAccountId;

    @Column(name = "provider_account_email", length = 320)
    private String providerAccountEmail;

    @Column(name = "encrypted_access_token", columnDefinition = "text")
    private String encryptedAccessToken;

    @Column(name = "encrypted_refresh_token", columnDefinition = "text")
    private String encryptedRefreshToken;

    @Column(name = "granted_scopes", nullable = false, columnDefinition = "text")
    private String grantedScopes;

    @Column(name = "token_expires_at")
    private LocalDateTime tokenExpiresAt;

    @CreationTimestamp
    @Column(name = "connected_at", nullable = false, updatable = false)
    private LocalDateTime connectedAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Column(name = "disconnected_at")
    private LocalDateTime disconnectedAt;

    @Version
    @Column(name = "version", nullable = false)
    private Long version;

    @PrePersist
    @PreUpdate
    private void validate() {
        if (user == null || provider == null) {
            throw new IllegalStateException("User and provider are required.");
        }
        if (providerAccountId == null || providerAccountId.isBlank()) {
            throw new IllegalStateException("Provider account ID is required.");
        }
        if (grantedScopes == null || grantedScopes.isBlank()) {
            throw new IllegalStateException("Granted scopes are required.");
        }
        if (disconnectedAt == null
                && (encryptedAccessToken == null || encryptedAccessToken.isBlank())) {
            throw new IllegalStateException("An active connection requires an access token.");
        }
    }

    public boolean isConnected() {
        return disconnectedAt == null;
    }

    public void disconnect() {
        encryptedAccessToken = null;
        encryptedRefreshToken = null;
        tokenExpiresAt = null;
        disconnectedAt = LocalDateTime.now();
    }
}
