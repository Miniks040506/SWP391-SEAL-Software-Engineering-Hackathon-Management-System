package com.t7.seal.service.impl;

import com.t7.seal.config.ProviderOAuthProperties;
import com.t7.seal.config.SubmissionProperties;
import com.t7.seal.domain.AuditActionType;
import com.t7.seal.domain.ExternalProvider;
import com.t7.seal.entities.ProviderOAuthConnection;
import com.t7.seal.entities.User;
import com.t7.seal.exception.NotFoundException;
import com.t7.seal.exception.ProviderIntegrationException;
import com.t7.seal.infrastructure.google.GoogleDriveOAuthClient;
import com.t7.seal.repository.ProviderOAuthConnectionRepository;
import com.t7.seal.repository.UserRepository;
import com.t7.seal.security.ProviderCredentialCipher;
import com.t7.seal.security.ProviderOAuthStateCodec;
import com.t7.seal.service.AuditLogService;
import com.t7.seal.service.GoogleDriveConnectionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionTemplate;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class GoogleDriveConnectionServiceImpl implements GoogleDriveConnectionService {

    private static final ExternalProvider PROVIDER = ExternalProvider.GOOGLE_DRIVE;
    private static final String TARGET_TABLE = "provider_oauth_connections";

    private final ProviderOAuthProperties oauthProperties;
    private final SubmissionProperties submissionProperties;
    private final ProviderOAuthStateCodec stateCodec;
    private final ProviderCredentialCipher credentialCipher;
    private final GoogleDriveOAuthClient googleClient;
    private final ProviderOAuthConnectionRepository connectionRepository;
    private final UserRepository userRepository;
    private final AuditLogService auditLogService;
    private final TransactionTemplate transactionTemplate;

    @Override
    public BeginConnection begin(User user, String returnPath) {
        requireUser(user);
        ensureAvailable();
        ProviderOAuthStateCodec.IssuedState issued = stateCodec.issue(
                user.getId(),
                PROVIDER,
                returnPath
        );
        return new BeginConnection(
                googleClient.authorizationUri(issued.stateToken(), issued.codeChallenge()),
                issued.browserNonce(),
                issued.expiresAt()
        );
    }

    @Override
    public CompletedConnection complete(String state, String browserNonce, String code) {
        ensureAvailable();
        ProviderOAuthStateCodec.VerifiedState verified = stateCodec.verify(
                state,
                browserNonce,
                PROVIDER
        );
        GoogleDriveOAuthClient.TokenGrant grant = googleClient.exchangeAuthorizationCode(
                code,
                verified.codeVerifier()
        );
        GoogleDriveOAuthClient.DriveAccount account = googleClient.fetchAccount(
                grant.accessToken()
        );

        transactionTemplate.executeWithoutResult(transactionStatus ->
                persistConnection(verified.userId(), grant, account)
        );
        return new CompletedConnection(verified.returnPath(), account.email());
    }

    @Override
    @Transactional(readOnly = true)
    public ConnectionStatus status(User user) {
        requireUser(user);
        Optional<ProviderOAuthConnection> connection = connectionRepository
                .findByUserIdAndProvider(user.getId(), PROVIDER);
        boolean available = isAvailable();
        String message = availabilityMessage(available);
        return connection
                .filter(ProviderOAuthConnection::isConnected)
                .map(value -> new ConnectionStatus(
                        available,
                        message,
                        true,
                        value.getProviderAccountEmail(),
                        toInstant(value.getConnectedAt()),
                        toInstant(value.getTokenExpiresAt())
                ))
                .orElseGet(() -> new ConnectionStatus(
                        available,
                        message,
                        false,
                        null,
                        null,
                        null
                ));
    }

    @Override
    @Transactional
    public void disconnect(User user) {
        requireUser(user);
        connectionRepository.findForUpdateByUserIdAndProvider(user.getId(), PROVIDER)
                .filter(ProviderOAuthConnection::isConnected)
                .ifPresent(connection -> {
                    Map<String, Object> before = auditState(connection, true);
                    connection.disconnect();
                    connectionRepository.save(connection);
                    auditLogService.record(
                            user,
                            AuditActionType.PROVIDER_DISCONNECTED,
                            TARGET_TABLE,
                            connection.getId(),
                            before,
                            auditState(connection, false),
                            Map.of("provider", PROVIDER.name())
                    );
                });
    }

    private void persistConnection(
            java.util.UUID userId,
            GoogleDriveOAuthClient.TokenGrant grant,
            GoogleDriveOAuthClient.DriveAccount account
    ) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("OAuth user no longer exists."));
        ProviderOAuthConnection connection = connectionRepository
                .findForUpdateByUserIdAndProvider(userId, PROVIDER)
                .orElseGet(() -> ProviderOAuthConnection.builder()
                        .user(user)
                        .provider(PROVIDER)
                        .build());
        Map<String, Object> before = connection.getId() == null
                ? null
                : auditState(connection, connection.isConnected());

        boolean sameAccount = Objects.equals(
                connection.getProviderAccountId(),
                account.providerAccountId()
        );
        if (grant.refreshToken() == null && !sameAccount) {
            throw ProviderIntegrationException.invalidResponse();
        }
        String encryptedRefreshToken = grant.refreshToken() == null
                ? connection.getEncryptedRefreshToken()
                : credentialCipher.encrypt(userId, PROVIDER, grant.refreshToken());
        if (encryptedRefreshToken == null) {
            throw ProviderIntegrationException.invalidResponse();
        }

        connection.setProviderAccountId(account.providerAccountId());
        connection.setProviderAccountEmail(account.email());
        connection.setEncryptedAccessToken(credentialCipher.encrypt(
                userId,
                PROVIDER,
                grant.accessToken()
        ));
        connection.setEncryptedRefreshToken(encryptedRefreshToken);
        connection.setGrantedScopes(grant.grantedScopes() == null
                ? String.join(" ", oauthProperties.getGoogleDrive().getScopes())
                : grant.grantedScopes());
        connection.setTokenExpiresAt(LocalDateTime.ofInstant(grant.expiresAt(), ZoneOffset.UTC));
        connection.setConnectedAt(LocalDateTime.now(ZoneOffset.UTC));
        connection.setDisconnectedAt(null);

        ProviderOAuthConnection saved = connectionRepository.save(connection);
        auditLogService.record(
                user,
                AuditActionType.PROVIDER_CONNECTED,
                TARGET_TABLE,
                saved.getId(),
                before,
                auditState(saved, true),
                Map.of("provider", PROVIDER.name())
        );
    }

    private Map<String, Object> auditState(
            ProviderOAuthConnection connection,
            boolean connected
    ) {
        Map<String, Object> state = new LinkedHashMap<>();
        state.put("provider", PROVIDER.name());
        state.put("connected", connected);
        state.put("providerAccountId", connection.getProviderAccountId());
        state.put("providerAccountEmail", connection.getProviderAccountEmail());
        return state;
    }

    private void ensureAvailable() {
        if (!isAvailable()) {
            throw ProviderIntegrationException.unavailable(availabilityMessage(false));
        }
    }

    private boolean isAvailable() {
        return submissionProperties.getProviders().getGoogleDrive().isEnabled()
                && oauthProperties.isGoogleDriveConfigured();
    }

    private String availabilityMessage(boolean available) {
        if (!submissionProperties.getProviders().getGoogleDrive().isEnabled()) {
            return submissionProperties.getProviders().getGoogleDrive().getUnavailableMessage();
        }
        return available
                ? "Google Drive is available."
                : oauthProperties.googleDriveConfigurationMessage();
    }

    private Instant toInstant(LocalDateTime value) {
        return value == null ? null : value.toInstant(ZoneOffset.UTC);
    }

    private void requireUser(User user) {
        if (user == null || user.getId() == null) {
            throw new IllegalArgumentException("Authenticated user is required.");
        }
    }
}
