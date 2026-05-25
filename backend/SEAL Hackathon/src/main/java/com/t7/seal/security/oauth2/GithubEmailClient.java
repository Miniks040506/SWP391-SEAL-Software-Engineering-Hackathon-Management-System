package com.t7.seal.security.oauth2;

import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.Arrays;
import java.util.Optional;

@Component
public class GithubEmailClient {

    private final RestClient restClient = RestClient.builder()
            .baseUrl("https://api.github.com")
            .build();

    public Optional<String> fetchPrimaryEmail(String accessToken) {
        GithubEmail[] emails = restClient.get()
                .uri("/user/emails")
                .header("Authorization", "Bearer " + accessToken)
                .header("Accept", "application/vnd.github+json")
                .retrieve()
                .body(GithubEmail[].class);

        if (emails == null) {
            return Optional.empty();
        }

        return Arrays.stream(emails)
                .filter(email -> Boolean.TRUE.equals(email.primary()))
                .filter(email -> Boolean.TRUE.equals(email.verified()))
                .map(GithubEmail::email)
                .findFirst();
    }

    public record GithubEmail(
            String email,
            Boolean primary,
            Boolean verified,
            String visibility
    ) {
    }
}
