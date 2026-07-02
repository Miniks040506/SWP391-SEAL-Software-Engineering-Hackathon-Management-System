package com.t7.seal.service.impl;

import com.t7.seal.domain.UserStatus;
import com.t7.seal.entities.User;
import com.t7.seal.repository.UserRepository;
import com.t7.seal.service.UnverifiedAccountAnonymizationService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UnverifiedAccountAnonymizationServiceImpl implements UnverifiedAccountAnonymizationService {

    @Value("${app.unverified-account.retention-days:7}")
    private int retentionDays;

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public int anonymizeExpiredUnverifiedAccounts() {
        LocalDateTime cutoff = LocalDateTime.now().minusDays(Math.max(retentionDays, 1));
        List<User> expiredUsers = userRepository.findByStatusAndCreatedAtBeforeOrderByCreatedAtAsc(
                UserStatus.UNVERIFIED,
                cutoff
        );

        expiredUsers.forEach(user -> user.anonymizeUnverifiedAccount(
                buildAnonymizedEmail(user),
                passwordEncoder.encode(UUID.randomUUID().toString())
        ));

        userRepository.saveAll(expiredUsers);

        return expiredUsers.size();
    }

    private String buildAnonymizedEmail(User user) {
        return "anonymized+" + user.getId().toString().replace("-", "") + "@deleted.local";
    }
}
