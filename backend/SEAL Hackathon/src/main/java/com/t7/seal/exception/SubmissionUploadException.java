package com.t7.seal.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public class SubmissionUploadException extends RuntimeException {

    private final HttpStatus status;
    private final String code;

    public SubmissionUploadException(HttpStatus status, String code, String message) {
        super(message);
        this.status = status;
        this.code = code;
    }

    public static SubmissionUploadException conflict(String code, String message) {
        return new SubmissionUploadException(HttpStatus.CONFLICT, code, message);
    }

    public static SubmissionUploadException badRequest(String code, String message) {
        return new SubmissionUploadException(HttpStatus.BAD_REQUEST, code, message);
    }

    public static SubmissionUploadException tooLarge(String message) {
        return new SubmissionUploadException(
                HttpStatus.CONTENT_TOO_LARGE,
                "SUBMISSION_FILE_TOO_LARGE",
                message
        );
    }

    public static SubmissionUploadException unsupported(String message) {
        return new SubmissionUploadException(
                HttpStatus.UNSUPPORTED_MEDIA_TYPE,
                "UNSUPPORTED_SUBMISSION_FILE",
                message
        );
    }
}
