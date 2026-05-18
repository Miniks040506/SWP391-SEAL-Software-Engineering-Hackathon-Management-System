package com.t7.seal.infrastructure;

import com.t7.seal.dto.UserPrincipal;
import org.springframework.security.core.Authentication;

import java.util.UUID;

public final class SecurityUtils {

    private SecurityUtils() {
    }

    public static UUID getCurrentUserId(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof UserPrincipal principal)) {
            throw new IllegalStateException("Authenticated user not found.");
        }

        return principal.getId();
    }
}