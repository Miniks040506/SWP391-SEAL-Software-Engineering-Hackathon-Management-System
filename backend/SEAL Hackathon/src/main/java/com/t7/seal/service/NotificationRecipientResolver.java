package com.t7.seal.service;

import com.t7.seal.response.system.NotificationRecipientResolutionResponse;

import java.util.UUID;

public interface NotificationRecipientResolver {
    NotificationRecipientResolutionResponse resolve(
            String targetScope,
            UUID targetId,
            UUID eventId,
            String role
    );
}
