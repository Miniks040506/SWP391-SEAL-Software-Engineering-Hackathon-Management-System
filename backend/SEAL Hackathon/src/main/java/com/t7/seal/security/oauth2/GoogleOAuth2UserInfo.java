package com.t7.seal.security.oauth2;

import java.util.Map;

public record GoogleOAuth2UserInfo(Map<String, Object> attributes) implements OAuth2UserInfo {

    @Override
    public String provider() {
        return "google";
    }

    @Override
    public String providerId() {
        return String.valueOf(attributes.get("sub"));
    }

    @Override
    public String email() {
        return (String) attributes.get("email");
    }

    @Override
    public String name() {
        return (String) attributes.getOrDefault("name", email());
    }

    @Override
    public String avatarUrl() {
        return (String) attributes.get("picture");
    }
}
