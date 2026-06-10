package com.t7.seal.service.impl;

import com.t7.seal.dto.UploadedSubmissionFile;
import com.t7.seal.service.SubmissionFileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.Duration;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class S3SubmissionFileStorageService implements SubmissionFileStorageService {

    @Value("${app.submission.storage.provider:AWS_S3}")
    private String storageProvider;

    @Value("${aws.s3.region:}")
    private String region;

    @Value("${aws.s3.bucket:}")
    private String bucket;

    @Value("${aws.s3.public-base-url:}")
    private String publicBaseUrl;

    @Value("${aws.s3.access-key:}")
    private String accessKey;

    @Value("${aws.s3.secret-key:}")
    private String secretKey;

    @Value("${app.submission.upload.max-size-mb:25}")
    private long maxSizeMb;

    @Value("${app.submission.upload.allowed-content-types:" +
            "application/pdf," +
            "application/zip," +
            "application/x-zip-compressed," +
            "application/vnd.ms-powerpoint," +
            "application/vnd.openxmlformats-officedocument.presentationml.presentation," +
            "video/mp4," +
            "image/png," +
            "image/jpeg," +
            "text/plain}")
    private String allowedContentType;

    @Override
    public UploadedSubmissionFile uploadSubmissionFile(
            UUID eventId,
            UUID teamId,
            UUID roundId,
            MultipartFile file
    ) {
        return null;
    }

    @Override
    public String createDownloadUrl(String objectKey, Duration ttl) {
        return "";
    }
}
