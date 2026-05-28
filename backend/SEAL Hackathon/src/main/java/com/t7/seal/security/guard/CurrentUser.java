package com.t7.seal.security.guard;

import com.t7.seal.dto.UserPrincipal;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;

import java.util.UUID;

public final class CurrentUser {

    private CurrentUser() {
    }

    public static UUID id(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new IllegalStateException("Current user is not authenticated.");
        }

        if (!(authentication.getPrincipal() instanceof UserPrincipal principal)) {
            throw new IllegalStateException("Unsupported principal type.");
        }

        return principal.getId();
    }

    public static boolean hasRole(Authentication authentication, String role) {
        String expected = role.startsWith("ROLE_") ? role : "ROLE_" + role;
        return authentication != null
                && authentication.getAuthorities() != null
                && authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(expected::equals);
    }

    public static boolean isAdmin(Authentication authentication) {
        return hasRole(authentication, "ADMIN");
    }

    public static boolean isCoordinator(Authentication authentication) {
        return hasRole(authentication, "COORDINATOR");
    }

    public static boolean isAdminOrCoordinator(Authentication authentication) {
        return isAdmin(authentication) || isCoordinator(authentication);
    }
}
