package com.t7.seal.service;

import com.t7.seal.entities.User;
import com.t7.seal.exception.NotFoundException;
import com.t7.seal.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class LoginAttemptPersistenceService {

    private final UserRepository userRepository;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void clearExpiredLock(String email) {
        userRepository.findByEmail(email).ifPresent(user -> {
            if (user.hasExpiredLock()) {
                user.clearExpiredLockIfNecessary();
                userRepository.saveAndFlush(user);
            }
        });
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public LoginFailureState recordFailure(
            UUID userId,
            int maxFailedAttempts,
            int lockDurationMinutes
    ) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found."));

        user.recordFailedLogin(maxFailedAttempts, lockDurationMinutes);
        userRepository.saveAndFlush(user);

        return new LoginFailureState(
                user.getFailedLoginCount(),
                user.getLockedUntil(),
                user.getRemainingLockSeconds()
        );
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void clearFailures(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found."));

        if ((user.getFailedLoginCount() != null && user.getFailedLoginCount() > 0)
                || user.getLockedUntil() != null) {
            user.clearFailedLoginAttempts();
            userRepository.saveAndFlush(user);
        }
    }

    public record LoginFailureState(
            int failedLoginCount,
            LocalDateTime lockedUntil,
            long remainingLockSeconds
    ) {
        public boolean locked() {
            return lockedUntil != null && remainingLockSeconds > 0;
        }
    }
}
