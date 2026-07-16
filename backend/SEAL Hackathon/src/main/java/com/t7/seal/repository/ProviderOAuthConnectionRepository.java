package com.t7.seal.repository;

import com.t7.seal.domain.ExternalProvider;
import com.t7.seal.entities.ProviderOAuthConnection;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProviderOAuthConnectionRepository
        extends JpaRepository<ProviderOAuthConnection, UUID> {

    Optional<ProviderOAuthConnection> findByUserIdAndProvider(
            UUID userId,
            ExternalProvider provider
    );

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<ProviderOAuthConnection> findForUpdateByUserIdAndProvider(
            UUID userId,
            ExternalProvider provider
    );
}
