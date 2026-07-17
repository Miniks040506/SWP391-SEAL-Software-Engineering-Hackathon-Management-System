package com.t7.seal.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RepositoryMetadata {

    private String platform;

    private String repoName;

    private String owner;

    private String repository;

    private String selectedReference;

    private String referenceType;

    private String commitSha;

    private String commitUrl;

    private String defaultBranch;

    private String visibility;

    private Integer commitCount;

    private Integer contributorCount;

    private LocalDateTime lastPushAt;

    private LocalDateTime committedAt;

    private LocalDateTime lastSynchronizedAt;

    private String accessError;

    private String primaryLanguage;

    private Boolean isPrivate;
}
