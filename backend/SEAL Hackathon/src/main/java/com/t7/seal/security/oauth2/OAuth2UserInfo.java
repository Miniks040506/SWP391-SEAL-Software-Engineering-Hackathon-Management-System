package com.t7.seal.security.oauth2;

public interface OAuth2UserInfo {
    String provider();
    String providerId();
    String email();
    String name();
    String avatarUrl();
}
