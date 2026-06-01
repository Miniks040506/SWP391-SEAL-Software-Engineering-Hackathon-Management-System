package com.t7.seal.security.oauth2;

import com.t7.seal.response.auth.LoginResponse;
import com.t7.seal.service.OAuth2Service;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientService;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Component
@RequiredArgsConstructor
public class OAuth2AuthenticationSuccessHandler implements AuthenticationSuccessHandler {

    private final OAuth2Service oAuth2Service;
    private final OAuth2AuthorizedClientService authorizedClientService;
    private final GithubEmailClient githubEmailClient;

    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    @Value("${app.oauth2.success-path:/oauth/callback}")
    private String successPath;

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication
    ) throws IOException, ServletException {
        OAuth2AuthenticationToken token = (OAuth2AuthenticationToken) authentication;
        String registrationId = token.getAuthorizedClientRegistrationId();

        try {
            String resolvedEmail = resolveEmailIfNeeded(token, registrationId);

            LoginResponse loginResponse = oAuth2Service.authenticateOAuth2User(
                    registrationId,
                    token.getPrincipal(),
                    resolvedEmail
            );

            String redirectUrl = UriComponentsBuilder
                    .fromUriString(frontendUrl + successPath)
                    .queryParam("accessToken", loginResponse.accessToken())
                    .queryParam("refreshToken", loginResponse.refreshToken())
                    .queryParam("userId", loginResponse.userId())
                    .queryParam("email", loginResponse.email())
                    .queryParam("fullName", loginResponse.fullName())
                    .queryParam("role", loginResponse.role())
                    .queryParam("status", loginResponse.status())
                    .queryParam("avatarUrl", loginResponse.avatarUrl() == null ? "" : loginResponse.avatarUrl())
                    .build()
                    .encode()
                    .toUriString();

            response.sendRedirect(redirectUrl);
        } catch (Exception ex) {
            String message = URLEncoder.encode(ex.getMessage(), StandardCharsets.UTF_8);
            response.sendRedirect(frontendUrl + "/login?oauthError=" + message);
        }
    }

    private String resolveEmailIfNeeded(OAuth2AuthenticationToken token, String registrationId) {
        if (!"github".equalsIgnoreCase(registrationId)) {
            return null;
        }

        OAuth2AuthorizedClient client = authorizedClientService.loadAuthorizedClient(
                registrationId,
                token.getName()
        );

        if (client == null || client.getAccessToken() == null) {
            return null;
        }

        return githubEmailClient.fetchPrimaryEmail(client.getAccessToken().getTokenValue())
                .orElse(null);
    }
}
