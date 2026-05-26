package com.t7.seal.repository;

import com.t7.seal.domain.UserStatus;
import com.t7.seal.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByEmail(String email);

    Optional<User> findByEmailAndEmailVerificationToken(
            String email,
            String emailVerificationToken
    );

    Optional<User> findByEmailAndPasswordResetToken(
            String email,
            String passwordResetToken
    );

    Optional<User> findByOauthProviderAndOauthProviderId(
            String oauthProvider,
            String oauthProviderId
    );

    boolean existsByEmail(String email);

    long countByStatus(UserStatus status);

}
