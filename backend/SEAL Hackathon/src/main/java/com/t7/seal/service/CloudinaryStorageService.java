package com.t7.seal.service;

import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

public interface CloudinaryStorageService {
    String uploadUserAvatar(UUID userId, MultipartFile file);
    String uploadEventBanner(MultipartFile file);
    String uploadRoundProblemStatement(UUID roundId, MultipartFile file);
}
