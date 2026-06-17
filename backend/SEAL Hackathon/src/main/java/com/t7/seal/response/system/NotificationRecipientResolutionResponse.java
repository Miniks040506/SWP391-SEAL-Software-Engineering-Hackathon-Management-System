package com.t7.seal.response.system;

import java.util.List;
import java.util.UUID;

public record NotificationRecipientResolutionResponse(
        String targetScope,
        UUID targetId,
        UUID eventId,
        String role,
        int totalRecipients,
        NotificationRecipientResponse primaryRecipient,
        List<NotificationRecipientResponse> to,
        List<NotificationRecipientResponse> cc,
        List<NotificationRecipientResponse> inAppRecipients
) {}
