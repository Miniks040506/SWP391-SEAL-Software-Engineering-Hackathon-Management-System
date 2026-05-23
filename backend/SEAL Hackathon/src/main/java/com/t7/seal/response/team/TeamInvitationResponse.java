package com.t7.seal.response.team;

import java.time.LocalDateTime;
import java.util.UUID;

public record TeamInvitationResponse(
        UUID id, UUID teamId,
        String invitedEmail,
        String status,
        LocalDateTime expiresAt
) {}
