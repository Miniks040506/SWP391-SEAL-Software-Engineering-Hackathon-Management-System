package com.t7.seal.service.impl;

import com.t7.seal.dto.UploadedSubmissionFile;
import com.t7.seal.service.SubmissionFileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.Duration;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SubmissionFileStorageServiceImpl implements SubmissionFileStorageService {
    @Override
    public UploadedSubmissionFile uploadSubmissionFile(UUID eventId, UUID teamId, UUID roundId, MultipartFile file) {
        return null;
    }

    @Override
    public String createDownloadUrl(String objectKey, Duration ttl) {
        return "";
    }
}
