package com.t7.seal.repository;

import com.t7.seal.entities.Prize;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PrizeRepository extends JpaRepository<Prize, UUID> {

    @Query("""
                    SELECT p FROM Prize p
                        JOIN p.event e 
                            WHERE e.id = :eventId
                                AND CAST(e.status AS STRING) NOT IN  ('DRAFT', 'CANCELLED') 
                                    ORDER BY p.rankPosition ASC 
            """)
    List<Prize> findPublicByEventId(
            @Param("eventId") UUID eventId);

    @Query("""
                    SELECT p FROM Prize p 
                        JOIN p.event e 
                            WHERE p.id = :prizeId
                                AND CAST(e.status AS STRING) NOT IN  ('DRAFT', 'CANCELLED')                     
            """)
    Optional<Prize> findPublicById(
            @Param("prizeId") UUID prizeId);
}
