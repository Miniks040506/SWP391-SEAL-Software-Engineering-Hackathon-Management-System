package com.t7.seal.response.round;

import java.util.UUID;

public record RoundResponse(
        UUID id, UUID eventId, String name, Integer orderIndex, Boolean isFinal, String status
) {}
