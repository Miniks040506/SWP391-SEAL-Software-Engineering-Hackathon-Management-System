package com.t7.seal.service;

import com.t7.seal.response.auth.LoginResponse;
import org.springframework.security.oauth2.core.user.OAuth2User;

public interface OAuth2Service {

    LoginResponse authenticateOAuth2User(
            String registrationId,
            OAuth2User oAuth2User,
            String resolvedEmail
    );
}
