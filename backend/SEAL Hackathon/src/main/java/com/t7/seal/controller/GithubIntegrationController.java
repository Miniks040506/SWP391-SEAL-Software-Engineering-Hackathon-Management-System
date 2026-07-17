package com.t7.seal.controller;

import com.t7.seal.config.ApiPaths;
import com.t7.seal.config.ProviderOAuthProperties;
import com.t7.seal.entities.User;
import com.t7.seal.exception.NotFoundException;
import com.t7.seal.exception.ProviderIntegrationException;
import com.t7.seal.response.ApiErrorResponse;
import com.t7.seal.response.auth.AuthMessageResponse;
import com.t7.seal.response.integration.GithubConnectionStatusResponse;
import com.t7.seal.response.integration.GithubOAuthStartResponse;
import com.t7.seal.response.integration.GithubReferenceResponse;
import com.t7.seal.response.integration.GithubRepositoryResponse;
import com.t7.seal.service.CurrentUserService;
import com.t7.seal.service.GithubConnectionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.time.Duration;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping(ApiPaths.API_V1 + "/integrations/github")
@Tag(name = "GitHub Integration", description = "Authenticated repository selection and snapshots.")
public class GithubIntegrationController {

    private static final String OAUTH_COOKIE = "seal_github_oauth";
    private static final String CALLBACK_PATH = ApiPaths.API_V1 + "/integrations/github/callback";
    private static final Duration COOKIE_LIFETIME = Duration.ofMinutes(5);
    private static final String DEFAULT_RETURN_PATH = "/events";

    private final GithubConnectionService connectionService;
    private final CurrentUserService currentUserService;
    private final ProviderOAuthProperties oauthProperties;

    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get GitHub connection status",
            security = @SecurityRequirement(name = "bearerAuth"))
    @GetMapping("/status")
    public GithubConnectionStatusResponse status(
            @Parameter(hidden = true) Authentication authentication
    ) {
        GithubConnectionService.ConnectionStatus status = connectionService.status(user(authentication));
        return new GithubConnectionStatusResponse(
                status.available(), status.availabilityMessage(), status.connected(),
                status.accountId(), status.accountEmail(), status.privateRepositoriesGranted(),
                status.connectedAt()
        );
    }

    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Start GitHub repository authorization",
            description = "Private repository access is optional and explicitly requested.",
            security = @SecurityRequirement(name = "bearerAuth"))
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Authorization flow created."),
            @ApiResponse(responseCode = "503", description = "GitHub is disabled or not configured.",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class)))
    })
    @PostMapping("/connect")
    public ResponseEntity<GithubOAuthStartResponse> connect(
            @RequestParam(defaultValue = DEFAULT_RETURN_PATH) String returnPath,
            @RequestParam(defaultValue = "false") boolean includePrivateRepositories,
            @Parameter(hidden = true) Authentication authentication
    ) {
        GithubConnectionService.BeginConnection connection = connectionService.begin(
                user(authentication), returnPath, includePrivateRepositories
        );
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE,
                        oauthCookie(connection.browserNonce(), COOKIE_LIFETIME).toString())
                .body(new GithubOAuthStartResponse(
                        connection.authorizationUri().toString(), connection.expiresAt()
                ));
    }

    @Operation(summary = "Complete GitHub repository authorization",
            description = "Public GitHub callback protected by encrypted state, PKCE, and browser binding.")
    @GetMapping("/callback")
    public ResponseEntity<Void> callback(
            @RequestParam(required = false) String code,
            @RequestParam(required = false) String state,
            @RequestParam(required = false) String error,
            @CookieValue(name = OAUTH_COOKIE, required = false) String browserNonce
    ) {
        URI redirect;
        if (error != null) {
            try {
                String returnPath = connectionService.validateCallbackState(state, browserNonce);
                String resultCode = "access_denied".equals(error)
                        ? "GITHUB_AUTHORIZATION_CANCELLED" : "GITHUB_AUTHORIZATION_FAILED";
                redirect = frontendRedirect(returnPath, "error", resultCode, false);
            } catch (IllegalArgumentException exception) {
                redirect = frontendRedirect(
                        DEFAULT_RETURN_PATH, "error", "GITHUB_OAUTH_STATE_INVALID", false
                );
            }
        } else {
            try {
                GithubConnectionService.CompletedConnection completed = connectionService.complete(
                        state, browserNonce, code
                );
                redirect = frontendRedirect(
                        completed.returnPath(), "connected", null,
                        completed.privateRepositoriesGranted()
                );
            } catch (ProviderIntegrationException exception) {
                redirect = frontendRedirect(DEFAULT_RETURN_PATH, "error", exception.getCode(), false);
            } catch (IllegalArgumentException exception) {
                redirect = frontendRedirect(
                        DEFAULT_RETURN_PATH, "error", "GITHUB_OAUTH_STATE_INVALID", false
                );
            } catch (NotFoundException exception) {
                redirect = frontendRedirect(
                        DEFAULT_RETURN_PATH, "error", "GITHUB_USER_NOT_FOUND", false
                );
            }
        }
        return ResponseEntity.status(HttpStatus.FOUND)
                .location(redirect)
                .header(HttpHeaders.SET_COOKIE, oauthCookie("", Duration.ZERO).toString())
                .build();
    }

    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Disconnect GitHub",
            description = "Clears credentials without deleting snapshotted submission metadata.",
            security = @SecurityRequirement(name = "bearerAuth"))
    @DeleteMapping("/connection")
    public AuthMessageResponse disconnect(
            @Parameter(hidden = true) Authentication authentication
    ) {
        connectionService.disconnect(user(authentication));
        return new AuthMessageResponse("GitHub disconnected.");
    }

    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "List repositories accessible to the connected GitHub user",
            security = @SecurityRequirement(name = "bearerAuth"))
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Repositories returned."),
            @ApiResponse(responseCode = "401", description = "GitHub authorization was revoked.",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))),
            @ApiResponse(responseCode = "409", description = "GitHub is not connected.",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))),
            @ApiResponse(responseCode = "429", description = "GitHub rate limit reached.",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class)))
    })
    @GetMapping("/repositories")
    public ResponseEntity<List<GithubRepositoryResponse>> repositories(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "50") int size,
            @Parameter(hidden = true) Authentication authentication
    ) {
        List<GithubRepositoryResponse> repositories = connectionService
                .repositories(user(authentication), page, size).stream()
                .map(GithubRepositoryResponse::from)
                .toList();
        return ResponseEntity.ok().cacheControl(CacheControl.noStore()).body(repositories);
    }

    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "List branches for an accessible repository",
            security = @SecurityRequirement(name = "bearerAuth"))
    @GetMapping("/repositories/{owner}/{repository}/branches")
    public ResponseEntity<List<GithubReferenceResponse>> branches(
            @PathVariable String owner,
            @PathVariable String repository,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "100") int size,
            @Parameter(hidden = true) Authentication authentication
    ) {
        return references(connectionService.branches(
                user(authentication), owner, repository, page, size
        ));
    }

    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "List tags for an accessible repository",
            security = @SecurityRequirement(name = "bearerAuth"))
    @GetMapping("/repositories/{owner}/{repository}/tags")
    public ResponseEntity<List<GithubReferenceResponse>> tags(
            @PathVariable String owner,
            @PathVariable String repository,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "100") int size,
            @Parameter(hidden = true) Authentication authentication
    ) {
        return references(connectionService.tags(
                user(authentication), owner, repository, page, size
        ));
    }

    private ResponseEntity<List<GithubReferenceResponse>> references(
            List<com.t7.seal.infrastructure.github.GithubSubmissionClient.ReferenceSummary> values
    ) {
        return ResponseEntity.ok().cacheControl(CacheControl.noStore())
                .body(values.stream().map(GithubReferenceResponse::from).toList());
    }

    private User user(Authentication authentication) {
        return currentUserService.getCurrentUser(authentication);
    }

    private ResponseCookie oauthCookie(String value, Duration maxAge) {
        return ResponseCookie.from(OAUTH_COOKIE, value)
                .httpOnly(true)
                .secure(oauthProperties.isCookieSecure())
                .sameSite("Lax")
                .path(CALLBACK_PATH)
                .maxAge(maxAge)
                .build();
    }

    private URI frontendRedirect(
            String returnPath, String result, String code, boolean privateRepositories
    ) {
        UriComponentsBuilder builder = UriComponentsBuilder.fromUriString(
                frontendUrl.replaceAll("/+$", "") + returnPath
        ).queryParam("github", result);
        if (code != null) builder.queryParam("code", code);
        if ("connected".equals(result)) {
            builder.queryParam("privateRepositories", privateRepositories);
        }
        return builder.build().encode().toUri();
    }
}
