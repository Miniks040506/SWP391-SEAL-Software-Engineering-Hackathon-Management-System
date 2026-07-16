package com.t7.seal.controller;

import com.t7.seal.config.ApiPaths;
import com.t7.seal.config.ProviderOAuthProperties;
import com.t7.seal.entities.User;
import com.t7.seal.exception.NotFoundException;
import com.t7.seal.exception.ProviderIntegrationException;
import com.t7.seal.response.ApiErrorResponse;
import com.t7.seal.response.auth.AuthMessageResponse;
import com.t7.seal.response.integration.GoogleDriveConnectionStatusResponse;
import com.t7.seal.response.integration.GoogleDriveOAuthStartResponse;
import com.t7.seal.response.integration.GoogleDrivePickerSessionResponse;
import com.t7.seal.service.CurrentUserService;
import com.t7.seal.service.GoogleDriveConnectionService;
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
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.CacheControl;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.time.Duration;

@RestController
@RequiredArgsConstructor
@RequestMapping(ApiPaths.API_V1 + "/integrations/google-drive")
@Tag(name = "Google Drive Integration", description = "Separate least-privilege Drive OAuth connection.")
public class GoogleDriveIntegrationController {

    private static final String OAUTH_COOKIE = "seal_google_drive_oauth";
    private static final String CALLBACK_PATH = ApiPaths.API_V1 + "/integrations/google-drive/callback";
    private static final Duration COOKIE_LIFETIME = Duration.ofMinutes(5);
    private static final String DEFAULT_RETURN_PATH = "/events";

    private final GoogleDriveConnectionService connectionService;
    private final CurrentUserService currentUserService;
    private final ProviderOAuthProperties oauthProperties;

    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    @PreAuthorize("isAuthenticated()")
    @Operation(
            summary = "Get Google Drive connection status",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponse(responseCode = "200", description = "Status returned.", useReturnTypeSchema = true)
    @GetMapping("/status")
    public GoogleDriveConnectionStatusResponse status(
            @Parameter(hidden = true) Authentication authentication
    ) {
        GoogleDriveConnectionService.ConnectionStatus status = connectionService.status(
                currentUserService.getCurrentUser(authentication)
        );
        return new GoogleDriveConnectionStatusResponse(
                status.available(),
                status.availabilityMessage(),
                status.connected(),
                status.accountEmail(),
                status.connectedAt(),
                status.tokenExpiresAt()
        );
    }

    @PreAuthorize("isAuthenticated()")
    @Operation(
            summary = "Start Google Drive authorization",
            description = "Creates encrypted state and PKCE values. The refresh token is never exposed.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Authorization flow created.", useReturnTypeSchema = true),
            @ApiResponse(responseCode = "503", description = "Drive is disabled or not configured.", content = @Content(schema = @Schema(implementation = ApiErrorResponse.class)))
    })
    @PostMapping("/connect")
    public ResponseEntity<GoogleDriveOAuthStartResponse> connect(
            @RequestParam(defaultValue = DEFAULT_RETURN_PATH) String returnPath,
            @Parameter(hidden = true) Authentication authentication
    ) {
        User user = currentUserService.getCurrentUser(authentication);
        GoogleDriveConnectionService.BeginConnection connection = connectionService.begin(
                user,
                returnPath
        );
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, oauthCookie(connection.browserNonce(), COOKIE_LIFETIME).toString())
                .body(new GoogleDriveOAuthStartResponse(
                        connection.authorizationUri().toString(),
                        connection.expiresAt()
                ));
    }

    @PreAuthorize("isAuthenticated()")
    @Operation(
            summary = "Create a Google Picker session",
            description = "Returns a short-lived access token for Picker. Refresh credentials remain server-side.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Picker session returned.", useReturnTypeSchema = true),
            @ApiResponse(responseCode = "401", description = "Drive authorization was revoked.", content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))),
            @ApiResponse(responseCode = "409", description = "Drive is not connected.", content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))),
            @ApiResponse(responseCode = "429", description = "Google rate limit reached.", content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))),
            @ApiResponse(responseCode = "503", description = "Drive is unavailable or not configured.", content = @Content(schema = @Schema(implementation = ApiErrorResponse.class)))
    })
    @GetMapping("/picker-session")
    public ResponseEntity<GoogleDrivePickerSessionResponse> pickerSession(
            @Parameter(hidden = true) Authentication authentication
    ) {
        GoogleDriveConnectionService.PickerSession session = connectionService.pickerSession(
                currentUserService.getCurrentUser(authentication)
        );
        return ResponseEntity.ok()
                .cacheControl(CacheControl.noStore())
                .body(new GoogleDrivePickerSessionResponse(
                        session.accessToken(),
                        session.expiresAt(),
                        session.pickerApiKey(),
                        session.appId()
                ));
    }

    @Operation(
            summary = "Complete Google Drive authorization",
            description = "Public Google callback protected by encrypted state, PKCE, and browser binding."
    )
    @GetMapping("/callback")
    public ResponseEntity<Void> callback(
            @RequestParam(required = false) String code,
            @RequestParam(required = false) String state,
            @RequestParam(required = false) String error,
            @CookieValue(name = OAUTH_COOKIE, required = false) String browserNonce
    ) {
        URI redirect;
        if (error != null) {
            String resultCode = "access_denied".equals(error)
                    ? "GOOGLE_DRIVE_AUTHORIZATION_CANCELLED"
                    : "GOOGLE_DRIVE_AUTHORIZATION_FAILED";
            redirect = frontendRedirect(DEFAULT_RETURN_PATH, "error", resultCode);
        } else {
            try {
                GoogleDriveConnectionService.CompletedConnection completed = connectionService.complete(
                        state,
                        browserNonce,
                        code
                );
                redirect = frontendRedirect(completed.returnPath(), "connected", null);
            } catch (ProviderIntegrationException exception) {
                redirect = frontendRedirect(DEFAULT_RETURN_PATH, "error", exception.getCode());
            } catch (IllegalArgumentException exception) {
                redirect = frontendRedirect(
                        DEFAULT_RETURN_PATH,
                        "error",
                        "GOOGLE_DRIVE_OAUTH_STATE_INVALID"
                );
            } catch (NotFoundException exception) {
                redirect = frontendRedirect(DEFAULT_RETURN_PATH, "error", "GOOGLE_DRIVE_USER_NOT_FOUND");
            }
        }

        return ResponseEntity.status(HttpStatus.FOUND)
                .location(redirect)
                .header(HttpHeaders.SET_COOKIE, oauthCookie("", Duration.ZERO).toString())
                .build();
    }

    @PreAuthorize("isAuthenticated()")
    @Operation(
            summary = "Disconnect Google Drive",
            description = "Clears stored provider credentials without deleting imported submission evidence.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponse(responseCode = "200", description = "Drive disconnected.")
    @DeleteMapping("/connection")
    public AuthMessageResponse disconnect(
            @Parameter(hidden = true) Authentication authentication
    ) {
        connectionService.disconnect(currentUserService.getCurrentUser(authentication));
        return new AuthMessageResponse("Google Drive disconnected.");
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

    private URI frontendRedirect(String returnPath, String result, String code) {
        UriComponentsBuilder builder = UriComponentsBuilder.fromUriString(
                frontendUrl.replaceAll("/+$", "") + returnPath
        ).queryParam("googleDrive", result);
        if (code != null) {
            builder.queryParam("code", code);
        }
        return builder.build().encode().toUri();
    }
}
