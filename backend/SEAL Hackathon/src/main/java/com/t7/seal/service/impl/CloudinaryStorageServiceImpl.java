package com.t7.seal.service.impl;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.t7.seal.config.CloudinaryProperties;
import com.t7.seal.exception.BadRequestException;
import com.t7.seal.exception.ExternalServiceException;
import com.t7.seal.service.CloudinaryStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CloudinaryStorageServiceImpl implements CloudinaryStorageService {

    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "image/jpeg", "image/png", "image/webp"
    );
    private static final long PROBLEM_STATEMENT_MAX_SIZE_BYTES = 20L * 1024 * 1024;

    private final Cloudinary cloudinary;
    private final CloudinaryProperties cloudinaryProperties;

    @Override
    public String uploadUserAvatar(UUID userId, MultipartFile file) {
        validateAvatar(file);

        try {
            String publicId = "user_" + userId + "_avatar";

            Map<?, ?> uploadResult = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap(
                            "folder", cloudinaryProperties.avatarFolder(),
                            "public_id", publicId,
                            "overwrite", true,
                            "resource_type", "image",
                            "unique_filename", false,
                            "use_filename", false,
                            "allowed_formats", new String[]{"jpg", "png", "webp", "jpeg"}
                    )
            );

            Object secureUrl = uploadResult.get("secure_url");

            if (secureUrl == null) {
                throw new ExternalServiceException("Avatar storage service did not return an upload URL.");
            }

            return secureUrl.toString();

        } catch (ExternalServiceException ex) {
            throw ex;
        } catch (IOException | RuntimeException ex) {
            throw new ExternalServiceException("Avatar storage service is unavailable.", ex);
        }
    }

    @Override
    public String uploadEventBanner(MultipartFile file) {
        validateImage(file, "Banner", cloudinaryProperties.bannerMaxSizeMb());
        try {
            Map<?, ?> uploadResult = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap(
                            "folder", cloudinaryProperties.bannerFolder(),
                            "resource_type", "image",
                            "allowed_formats", new String[]{"jpg", "jpeg", "png", "webp"}
                    )
            );
            Object secureUrl = uploadResult.get("secure_url");
            if (secureUrl == null) {
                throw new ExternalServiceException("Banner storage service did not return an upload URL.");
            }
            return secureUrl.toString();
        } catch (ExternalServiceException ex) {
            throw ex;
        } catch (IOException | RuntimeException ex) {
            throw new ExternalServiceException("Banner storage service is unavailable.", ex);
        }
    }

    @Override
    public String uploadRoundProblemStatement(UUID roundId, MultipartFile file) {
        validateProblemStatement(file);

        try {
            Map<?, ?> uploadResult = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap(
                            "folder", "seal/problem-statements",
                            "public_id", "round_" + roundId + "_problem_statement.pdf",
                            "overwrite", true,
                            "resource_type", "raw",
                            "unique_filename", false,
                            "use_filename", false,
                            "allowed_formats", new String[]{"pdf"}
                    )
            );
            Object secureUrl = uploadResult.get("secure_url");
            if (secureUrl == null) {
                throw new ExternalServiceException("Problem statement storage service did not return an upload URL.");
            }
            return secureUrl.toString();
        } catch (ExternalServiceException ex) {
            throw ex;
        } catch (IOException | RuntimeException ex) {
            throw new ExternalServiceException("Problem statement storage service is unavailable.", ex);
        }
    }

    //HELPERS
    private void validateAvatar(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Avatar is required");
        }

        String contentType = file.getContentType();

        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType)) {
            throw new BadRequestException("Avatar must be a JPEG, PNG, or WEBP image");
        }

        long maxSizeBytes = cloudinaryProperties.avatarMaxSizeMb() * 1024 * 1024;

        if (file.getSize() > maxSizeBytes) {
            throw new BadRequestException("Avatar must be less than " + cloudinaryProperties.avatarMaxSizeMb() + "MB");
        }
    }

    private void validateImage(MultipartFile file, String label, long maxSizeMb) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException(label + " file is required.");
        }

        String contentType = file.getContentType();

        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType)) {
            throw new BadRequestException(label + " must be JPG, PNG, or WEBP.");
        }

        long maxSizeBytes = maxSizeMb * 1024 * 1024;

        if (file.getSize() > maxSizeBytes) {
            throw new BadRequestException(label + " must not exceed " + maxSizeMb + "MB.");
        }
    }

    private void validateProblemStatement(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Problem statement PDF is required.");
        }

        String contentType = file.getContentType();
        String filename = file.getOriginalFilename();
        if (!"application/pdf".equalsIgnoreCase(contentType)
                || filename == null
                || !filename.toLowerCase().endsWith(".pdf")) {
            throw new BadRequestException("Problem statement must be a PDF file.");
        }

        if (file.getSize() > PROBLEM_STATEMENT_MAX_SIZE_BYTES) {
            throw new BadRequestException("Problem statement PDF must not exceed 20MB.");
        }
    }
}
