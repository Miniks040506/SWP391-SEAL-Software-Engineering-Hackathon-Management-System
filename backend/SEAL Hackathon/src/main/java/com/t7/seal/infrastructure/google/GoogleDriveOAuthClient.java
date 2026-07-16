package com.t7.seal.infrastructure.google;

import java.io.InputStream;
import java.net.URI;
import java.time.Instant;

public interface GoogleDriveOAuthClient {

    URI authorizationUri(String state, String codeChallenge);

    TokenGrant exchangeAuthorizationCode(String code, String codeVerifier);

    TokenGrant refreshAccessToken(String refreshToken);

    DriveAccount fetchAccount(String accessToken);

    DriveFile fetchFile(String accessToken, String fileId);

    InputStream downloadFile(String accessToken, String fileId);

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

    record DriveFile(
            String fileId,
            String name,
            String mimeType,
            Long sizeBytes,
            URI viewUri,
            String checksum,
            Instant modifiedAt,
            boolean downloadAllowed
    ) {
    }
}
