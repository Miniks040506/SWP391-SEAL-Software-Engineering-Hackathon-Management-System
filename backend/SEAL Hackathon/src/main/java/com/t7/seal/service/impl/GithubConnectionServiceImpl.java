package com.t7.seal.service.impl;

import com.t7.seal.config.ProviderOAuthProperties;
import com.t7.seal.config.SubmissionProperties;
import com.t7.seal.domain.AuditActionType;
import com.t7.seal.domain.ExternalProvider;
import com.t7.seal.entities.ProviderOAuthConnection;
import com.t7.seal.entities.User;
import com.t7.seal.exception.NotFoundException;
import com.t7.seal.exception.ProviderIntegrationException;
import com.t7.seal.infrastructure.github.GithubSubmissionClient;
import com.t7.seal.repository.ProviderOAuthConnectionRepository;
import com.t7.seal.repository.UserRepository;
import com.t7.seal.security.ProviderCredentialCipher;
import com.t7.seal.security.ProviderOAuthStateCodec;
import com.t7.seal.service.AuditLogService;
import com.t7.seal.service.GithubConnectionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionTemplate;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;

@Service
@RequiredArgsConstructor
public class GithubConnectionServiceImpl implements GithubConnectionService {

    private static final ExternalProvider PROVIDER = ExternalProvider.GITHUB;
    private static final String TARGET_TABLE = "provider_oauth_connections";
    private static final String PUBLIC_ONLY = "PUBLIC_ONLY";

    private final ProviderOAuthProperties oauthProperties;
    private final SubmissionProperties submissionProperties;
    private final ProviderOAuthStateCodec stateCodec;
    private final ProviderCredentialCipher credentialCipher;
    private final GithubSubmissionClient githubClient;
    private final ProviderOAuthConnectionRepository connectionRepository;
    private final UserRepository userRepository;
    private final AuditLogService auditLogService;
    private final TransactionTemplate transactionTemplate;

    @Override
    public BeginConnection begin(
            User user, String returnPath, boolean includePrivateRepositories
    ) {
        requireUser(user);
        ensureAvailable();
        ProviderOAuthStateCodec.IssuedState issued = stateCodec.issue(
                user.getId(), PROVIDER, returnPath
        );
        return new BeginConnection(
                githubClient.authorizationUri(
                        issued.stateToken(), issued.codeChallenge(), includePrivateRepositories
                ),
                issued.browserNonce(),
                issued.expiresAt()
        );
    }

    @Override
    public CompletedConnection complete(String state, String browserNonce, String code) {
        ensureAvailable();
        ProviderOAuthStateCodec.VerifiedState verified = stateCodec.verify(
                state, browserNonce, PROVIDER
        );
        GithubSubmissionClient.TokenGrant grant = githubClient.exchangeAuthorizationCode(
                code, verified.codeVerifier()
        );
        GithubSubmissionClient.Account account = githubClient.fetchAccount(grant.accessToken());
        transactionTemplate.executeWithoutResult(status -> persistConnection(
                verified.userId(), grant, account
        ));
        return new CompletedConnection(
                verified.returnPath(), account.providerAccountId(), account.email(),
                hasPrivateScope(normalizedScopes(grant.grantedScopes()))
        );
    }

    @Override
    public String validateCallbackState(String state, String browserNonce) {
        return stateCodec.verify(state, browserNonce, PROVIDER).returnPath();
    }

    @Override
    @Transactional(readOnly = true)
    public ConnectionStatus status(User user) {
        requireUser(user);
        Optional<ProviderOAuthConnection> connection = connectionRepository
                .findByUserIdAndProvider(user.getId(), PROVIDER);
        boolean available = isAvailable();
        String message = availabilityMessage(available);
        return connection.filter(ProviderOAuthConnection::isConnected)
                .map(value -> new ConnectionStatus(
                        available, message, true,
                        value.getProviderAccountId(), value.getProviderAccountEmail(),
                        hasPrivateScope(value.getGrantedScopes()),
                        toInstant(value.getConnectedAt())
                ))
                .orElseGet(() -> new ConnectionStatus(
                        available, message, false, null, null, false, null
                ));
    }

    @Override
    public List<GithubSubmissionClient.RepositorySummary> repositories(
            User user, int page, int pageSize
    ) {
        return withToken(user, token -> githubClient.listRepositories(token, page, pageSize));
    }

    @Override
    public List<GithubSubmissionClient.ReferenceSummary> branches(
            User user, String owner, String repository, int page, int pageSize
    ) {
        return withToken(user, token -> githubClient.listBranches(
                token, owner, repository, page, pageSize
        ));
    }

    @Override
    public List<GithubSubmissionClient.ReferenceSummary> tags(
            User user, String owner, String repository, int page, int pageSize
    ) {
        return withToken(user, token -> githubClient.listTags(
                token, owner, repository, page, pageSize
        ));
    }

    @Override
    public GithubSubmissionClient.RepositorySnapshot snapshot(
            User user, String owner, String repository, String reference
    ) {
        return withToken(user, token -> githubClient.resolveSnapshot(
                token, owner, repository, reference
        ));
    }

    @Override
    @Transactional
    public void disconnect(User user) {
        requireUser(user);
        disconnectLocked(user);
    }

    private <T> T withToken(User user, Function<String, T> operation) {
        requireUser(user);
        ensureAvailable();
        ProviderOAuthConnection connection = connectionRepository
                .findByUserIdAndProvider(user.getId(), PROVIDER)
                .filter(ProviderOAuthConnection::isConnected)
                .orElseThrow(this::notConnected);
        String token = credentialCipher.decrypt(
                user.getId(), PROVIDER, connection.getEncryptedAccessToken()
        );
        try {
            return operation.apply(token);
        } catch (ProviderIntegrationException exception) {
            if ("GITHUB_AUTHORIZATION_INVALID".equals(exception.getCode())) {
                transactionTemplate.executeWithoutResult(status -> disconnectLocked(user));
            }
            throw exception;
        }
    }

    private void persistConnection(
            java.util.UUID userId,
            GithubSubmissionClient.TokenGrant grant,
            GithubSubmissionClient.Account account
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
                ? null : auditState(connection, connection.isConnected());

        connection.setProviderAccountId(account.providerAccountId());
        connection.setProviderAccountEmail(account.email());
        connection.setEncryptedAccessToken(credentialCipher.encrypt(
                userId, PROVIDER, grant.accessToken()
        ));
        connection.setEncryptedRefreshToken(null);
        connection.setGrantedScopes(normalizedScopes(grant.grantedScopes()));
        connection.setTokenExpiresAt(null);
        connection.setConnectedAt(LocalDateTime.now(ZoneOffset.UTC));
        connection.setDisconnectedAt(null);

        ProviderOAuthConnection saved = connectionRepository.save(connection);
        auditLogService.record(
                user, AuditActionType.PROVIDER_CONNECTED, TARGET_TABLE, saved.getId(),
                before, auditState(saved, true), Map.of("provider", PROVIDER.name())
        );
    }

    private void disconnectLocked(User user) {
        connectionRepository.findForUpdateByUserIdAndProvider(user.getId(), PROVIDER)
                .filter(ProviderOAuthConnection::isConnected)
                .ifPresent(connection -> {
                    Map<String, Object> before = auditState(connection, true);
                    connection.disconnect();
                    connectionRepository.save(connection);
                    auditLogService.record(
                            user, AuditActionType.PROVIDER_DISCONNECTED,
                            TARGET_TABLE, connection.getId(), before,
                            auditState(connection, false), Map.of("provider", PROVIDER.name())
                    );
                });
    }

    private String normalizedScopes(String scopes) {
        return scopes == null || scopes.isBlank() ? PUBLIC_ONLY : scopes.trim();
    }

    private boolean hasPrivateScope(String scopes) {
        if (scopes == null || scopes.isBlank() || PUBLIC_ONLY.equals(scopes)) return false;
        return Arrays.stream(scopes.split("[\\s,]+"))
                .anyMatch("repo"::equals);
    }

    private Map<String, Object> auditState(
            ProviderOAuthConnection connection, boolean connected
    ) {
        Map<String, Object> state = new LinkedHashMap<>();
        state.put("provider", PROVIDER.name());
        state.put("connected", connected);
        state.put("providerAccountId", connection.getProviderAccountId());
        state.put("providerAccountEmail", connection.getProviderAccountEmail());
        state.put("privateRepositoriesGranted", hasPrivateScope(connection.getGrantedScopes()));
        return state;
    }

    private void ensureAvailable() {
        if (!isAvailable()) {
            throw error(HttpStatus.SERVICE_UNAVAILABLE, "GITHUB_UNAVAILABLE",
                    availabilityMessage(false));
        }
    }

    private boolean isAvailable() {
        return submissionProperties.getProviders().getGithub().isEnabled()
                && oauthProperties.isGithubConfigured();
    }

    private String availabilityMessage(boolean available) {
        if (!submissionProperties.getProviders().getGithub().isEnabled()) {
            return submissionProperties.getProviders().getGithub().getUnavailableMessage();
        }
        return available ? "GitHub repository connection is available."
                : oauthProperties.githubConfigurationMessage();
    }

    private ProviderIntegrationException notConnected() {
        return error(HttpStatus.CONFLICT, "GITHUB_NOT_CONNECTED",
                "Connect GitHub before choosing a repository.");
    }

    private ProviderIntegrationException error(
            HttpStatus status, String code, String message
    ) {
        return new ProviderIntegrationException(status, code, message);
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
