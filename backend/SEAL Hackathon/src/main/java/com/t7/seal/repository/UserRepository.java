package com.t7.seal.repository;

import com.t7.seal.domain.UserStatus;
import com.t7.seal.entities.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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

    boolean existsByEmailIgnoreCase(String email);

    long countByStatus(UserStatus status);

    @Query("""
            SELECT u
            FROM User u
            WHERE (:role IS NULL OR CAST(u.role AS string) = :role)
              AND (:status IS NULL OR CAST(u.status AS string) = :status)
              AND (
                    :search IS NULL
                    OR LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%'))
                    OR LOWER(u.fullName) LIKE LOWER(CONCAT('%', :search, '%'))
                  )
            ORDER BY u.createdAt DESC
            """)
    Page<User> searchUsers(
            @Param("role") String role,
            @Param("status") String status,
            @Param("search") String search,
            Pageable pageable
    );

    Page<User> findByStatusOrderByEmailVerifiedAtAscCreatedAtAsc(
            UserStatus status,
            Pageable pageable
    );

}
