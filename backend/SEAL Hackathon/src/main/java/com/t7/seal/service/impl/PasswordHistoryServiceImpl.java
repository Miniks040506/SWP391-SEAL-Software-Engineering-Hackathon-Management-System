package com.t7.seal.service.impl;

import com.t7.seal.entities.PasswordHistory;
import com.t7.seal.entities.User;
import com.t7.seal.exception.BadRequestException;
import com.t7.seal.repository.PasswordHistoryRepository;
import com.t7.seal.service.PasswordHistoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PasswordHistoryServiceImpl implements PasswordHistoryService {

    @Value("${app.password-history.limit:5}")
    private int passwordHistoryLimit;

    private final PasswordHistoryRepository passwordHistoryRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional(readOnly = true)
    public void validateNotReused(User user, String rawPassword) {
        if (passwordEncoder.matches(rawPassword, user.getPasswordHash())) {
            throw new BadRequestException(
                    "PASSWORD_REUSED",
                    "New password must be different from the current password."
            );
        }

        List<PasswordHistory> histories = passwordHistoryRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        boolean reused = histories.stream()
                .limit(normalizedHistoryLimit())
                .anyMatch(history -> passwordEncoder.matches(rawPassword, history.getPasswordHash()));

        if (reused) {
            throw new BadRequestException(
                    "PASSWORD_REUSED",
                    "New password must not match any of your previous passwords."
            );
        }
    }

    @Override
    @Transactional
    public void recordPassword(User user, String passwordHash) {
        passwordHistoryRepository.save(PasswordHistory.builder()
                .user(user)
                .passwordHash(passwordHash)
                .build());

        trimStoredHistory(user);
    }

    private void trimStoredHistory(User user) {
        List<PasswordHistory> histories = passwordHistoryRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        int keep = normalizedHistoryLimit();

        if (histories.size() > keep) {
            passwordHistoryRepository.deleteAll(histories.subList(keep, histories.size()));
        }
    }

    private int normalizedHistoryLimit() {
        return Math.max(passwordHistoryLimit, 1);
    }
}
