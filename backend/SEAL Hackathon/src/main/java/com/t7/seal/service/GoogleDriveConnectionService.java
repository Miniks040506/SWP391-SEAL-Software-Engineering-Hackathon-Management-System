package com.t7.seal.service;

import com.t7.seal.entities.User;

import java.io.InputStream;
import java.net.URI;
import java.time.Instant;

public interface GoogleDriveConnectionService {

    BeginConnection begin(User user, String returnPath);

    CompletedConnection complete(String state, String browserNonce, String code);

    String validateCallbackState(String state, String browserNonce);

    ConnectionStatus status(User user);

    PickerSession pickerSession(User user);

    SelectedDriveFile openSelectedFile(User user, String fileId);

    void disconnect(User user);

    record BeginConnection(
            URI authorizationUri,
            String browserNonce,
            Instant expiresAt
    ) {
    }

    record CompletedConnection(
            String returnPath,
            String accountEmail
    ) {
    }

    record ConnectionStatus(
            boolean available,
            String availabilityMessage,
            boolean connected,
            String accountEmail,
            Instant connectedAt,
            Instant tokenExpiresAt
    ) {
    }

    record PickerSession(
            String accessToken,
            Instant expiresAt,
            String pickerApiKey,
            String appId
    ) {
    }

    record SelectedDriveFile(
            String fileId,
            String name,
            String mimeType,
            long sizeBytes,
            URI viewUri,
            String checksum,
            Instant modifiedAt,
            InputStream content
    ) {
    }
}
