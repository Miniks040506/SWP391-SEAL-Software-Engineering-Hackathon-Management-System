package com.t7.seal.dto;

public record UploadedSubmissionFile(
        String url,
        String objectKey,
        String originalFileName,
        String contentType,
        long fileSizeBytes
) {
}
