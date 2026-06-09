package com.t7.seal.infrastructure;

public record UploadedSubmissionFile(
        String url,
        String objectKey,
        String originalFileName,
        String contentType,
        long fileSizeBytes
) {
}
