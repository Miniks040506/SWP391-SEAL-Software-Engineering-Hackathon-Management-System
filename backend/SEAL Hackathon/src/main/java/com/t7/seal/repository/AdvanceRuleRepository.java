package com.t7.seal.repository;

import com.t7.seal.domain.RuleType;
import com.t7.seal.entities.AdvanceRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AdvanceRuleRepository extends JpaRepository<AdvanceRule, UUID> {

    List<AdvanceRule> findByRoundIdOrderByPriorityAscRuleTypeAsc(UUID roundId);

    @Query("""
            SELECT COUNT(ar) > 0 FROM AdvanceRule ar
                WHERE ar.round.id = :roundId 
                    AND ar.track.id IS NULL 
                        AND ar.ruleType = :ruleType
            """)
    boolean existGlobalRule(
            @Param("roundId") UUID roundId,
            @Param("ruleType") RuleType ruleType
    );

    boolean existsByRoundIdAndRuleTypeAndTrackId(UUID roundId, RuleType ruleType, UUID trackId);
}
