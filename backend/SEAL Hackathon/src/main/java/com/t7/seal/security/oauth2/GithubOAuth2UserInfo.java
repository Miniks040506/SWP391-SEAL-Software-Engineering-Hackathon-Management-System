package com.t7.seal.security.oauth2;

import java.util.Map;

public record GithubOAuth2UserInfo(
        Map<String, Object> attributes,
        String resolvedEmail
) implements OAuth2UserInfo {

    @Override
    public String provider() {
        return "github";
    }

    @Override
    public String providerId() {
        return String.valueOf(attributes.get("id"));
    }

    @Override
    public String email() {
        Object email = attributes.get("email");
        if (email instanceof String value && !value.isBlank()) {
            return value;
        }
        return resolvedEmail;
    }

    @Override
    public String name() {
        Object name = attributes.get("name");
        if (name instanceof String value && !value.isBlank()) {
            return value;
        }

        Object login = attributes.get("login");
        if (login instanceof String value && !value.isBlank()) {
            return value;
        }

        return email();
    }

    @Override
    public String avatarUrl() {
        return (String) attributes.get("avatar_url");
    }
}
