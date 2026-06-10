package com.t7.seal.service;

import com.t7.seal.domain.SubmissionLinkType;
import com.t7.seal.dto.RepositoryMetadata;

public interface RepositoryMetadataService {
    RepositoryMetadata fetchMetadataIfRepository(SubmissionLinkType linkType, String url);
}
