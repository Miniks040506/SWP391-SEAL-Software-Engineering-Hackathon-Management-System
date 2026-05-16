package com.t7.seal.infrastructure;

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

    private Integer commitCount;

    private Integer contributorCount;

    private LocalDateTime lastPushAt;

    private String primaryLanguage;

    private Boolean isPrivate;
}
