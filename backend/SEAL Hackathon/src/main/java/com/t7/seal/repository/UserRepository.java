package com.t7.seal.repository;

import com.t7.seal.domain.UserRole;
import com.t7.seal.domain.UserStatus;
import com.t7.seal.entities.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID>, JpaSpecificationExecutor<User> {

    List<User> findByRoleAndStatusOrderByFullNameAsc(
            UserRole role,
            UserStatus status
    );

    @Query("""
        select u
        from User u
        where u.role = :role
          and u.status = :status
          and (
            lower(u.email) like concat('%', :keyword, '%')
            or lower(u.fullName) like concat('%', :keyword, '%')
          )
        order by u.fullName asc
    """)
    List<User> searchAssignableUsers(
            @Param("role") UserRole role,
            @Param("status") UserStatus status,
            @Param("keyword") String keyword
    );

    Optional<User> findByEmail(String email);

    Optional<User> findByEmailIgnoreCase(String email);

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


    Page<User> findByStatusOrderByEmailVerifiedAtAscCreatedAtAsc(
            UserStatus status,
            Pageable pageable
    );

}
