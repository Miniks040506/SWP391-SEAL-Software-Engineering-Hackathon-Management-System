package com.t7.seal.service;

import com.t7.seal.entities.User;

import java.net.URI;
import java.time.Instant;

public interface GoogleDriveConnectionService {

    BeginConnection begin(User user, String returnPath);

    CompletedConnection complete(String state, String browserNonce, String code);

    ConnectionStatus status(User user);

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
}
