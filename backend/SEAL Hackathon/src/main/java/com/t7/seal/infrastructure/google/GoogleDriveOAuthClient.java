package com.t7.seal.infrastructure.google;

import java.net.URI;
import java.time.Instant;

public interface GoogleDriveOAuthClient {

    URI authorizationUri(String state, String codeChallenge);

    TokenGrant exchangeAuthorizationCode(String code, String codeVerifier);

    TokenGrant refreshAccessToken(String refreshToken);

    DriveAccount fetchAccount(String accessToken);

    record TokenGrant(
            String accessToken,
            String refreshToken,
            String grantedScopes,
            Instant expiresAt
    ) {
    }

    record DriveAccount(
            String providerAccountId,
            String email,
            String displayName
    ) {
    }
}
