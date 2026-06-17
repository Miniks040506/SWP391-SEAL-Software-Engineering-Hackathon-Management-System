package com.t7.seal.response.system;

import java.util.UUID;

public record NotificationRecipientResponse(
        UUID userId,
        String fullName,
        String email,
        String role,
        String status,
        String deliveryRole
) {}
