package com.t7.seal.service.impl;

import com.t7.seal.domain.SubmissionLinkType;
import com.t7.seal.infrastructure.RepositoryMetadata;
import com.t7.seal.service.RepositoryMetadataService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class RepositoryMetadataServiceImpl implements RepositoryMetadataService {

    @Override
    public RepositoryMetadata fetchMetadataIfRepository(SubmissionLinkType linkType, String url) {
        return null;
    }
}
